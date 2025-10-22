import { Doctor, IDoctor } from '../models/Doctor';
import { FilterQuery } from 'mongoose';

export interface DoctorFilters {
  q?: string;
  specialty?: string;
  city?: string;
  state?: string;
  minRating?: number;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface DoctorSearchResult {
  doctors: IDoctor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DoctorDAO {
  /**
   * Search doctors with filters and pagination
   */
  static async searchDoctors(
    filters: DoctorFilters,
    pagination: PaginationOptions
  ): Promise<DoctorSearchResult> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build MongoDB filter
    const mongoFilter: FilterQuery<IDoctor> = {};

    // Default filters
    if (filters.isActive !== undefined) {
      mongoFilter.isActive = filters.isActive;
    }
    if (filters.emailVerified !== undefined) {
      mongoFilter.emailVerified = filters.emailVerified;
    }

    // Text search across name and bio
    if (filters.q) {
      mongoFilter.$or = [
        { 'profile.firstName': { $regex: filters.q, $options: 'i' } },
        { 'profile.lastName': { $regex: filters.q, $options: 'i' } },
        { bio: { $regex: filters.q, $options: 'i' } },
      ];
    }

    // Specialty filter
    if (filters.specialty) {
      mongoFilter.specialties = { $in: [filters.specialty] };
    }

    // Location filters
    if (filters.city) {
      mongoFilter['location.city'] = { $regex: filters.city, $options: 'i' };
    }
    if (filters.state) {
      mongoFilter['location.state'] = { $regex: filters.state, $options: 'i' };
    }

    // Rating filter
    if (filters.minRating) {
      mongoFilter.rating = { $gte: filters.minRating };
    }

    // Execute queries in parallel
    const [doctors, total] = await Promise.all([
      Doctor.find(mongoFilter)
        .select('-password') // Exclude password
        .sort({ rating: -1, reviewCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Doctor.countDocuments(mongoFilter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      doctors: doctors as any,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get doctor by ID
   */
  static async getById(id: string): Promise<IDoctor | null> {
    return Doctor.findById(id).select('-password').lean() as any;
  }

  /**
   * Get doctors by specialty
   */
  static async getBySpecialty(
    specialty: string,
    pagination: PaginationOptions
  ): Promise<DoctorSearchResult> {
    return this.searchDoctors({ specialty }, pagination);
  }

  /**
   * Get doctors by location
   */
  static async getByLocation(
    city: string,
    state?: string,
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<DoctorSearchResult> {
    return this.searchDoctors({ city, state }, pagination);
  }

  /**
   * Get top-rated doctors
   */
  static async getTopRated(
    limit: number = 10,
    minRating: number = 4.0
  ): Promise<IDoctor[]> {
    return Doctor.find({
      isActive: true,
      emailVerified: true,
      rating: { $gte: minRating },
    })
      .select('-password')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .lean() as any;
  }

  /**
   * Get doctor statistics
   */
  static async getStatistics(): Promise<{
    total: number;
    active: number;
    verified: number;
    averageRating: number;
    specialtyCounts: Array<{ specialty: string; count: number }>;
  }> {
    const [total, active, verified, ratingStats, specialtyStats] =
      await Promise.all([
        Doctor.countDocuments(),
        Doctor.countDocuments({ isActive: true }),
        Doctor.countDocuments({ emailVerified: true }),
        Doctor.aggregate([
          { $match: { isActive: true, emailVerified: true } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
            },
          },
        ]),
        Doctor.aggregate([
          { $match: { isActive: true, emailVerified: true } },
          { $unwind: '$specialties' },
          {
            $group: {
              _id: '$specialties',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

    return {
      total,
      active,
      verified,
      averageRating: ratingStats[0]?.averageRating || 0,
      specialtyCounts: specialtyStats.map((stat) => ({
        specialty: stat._id,
        count: stat.count,
      })),
    };
  }
}
