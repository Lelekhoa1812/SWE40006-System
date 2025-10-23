'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

// Simple SVG icons
const Search = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const Filter = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);
import { fetchJson } from '@/lib/api';
import { DoctorCard } from '@/components/doctor-card';
import { DoctorCardSkeleton } from '@/components/doctor-card-skeleton';
import { useToast } from '@/components/ui/use-toast';

interface Doctor {
  id: string;
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    avatar?: string;
  };
  medicalLicense: string;
  specialties: string[];
  bio?: string;
  location?: {
    address?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availability?: {
    timezone: string;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
  };
  rating: number;
  reviewCount: number;
  consultationFee?: number;
  languages: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface DoctorsResponse {
  doctors: Doctor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const specialties = [
  'All Specialties',
  'cardiology',
  'dermatology',
  'endocrinology',
  'gastroenterology',
  'general_practice',
  'neurology',
  'oncology',
  'orthopedics',
  'pediatrics',
  'psychiatry',
  'radiology',
  'surgery',
  'urology',
];

export default function DoctorsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [minRating, setMinRating] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const loadDoctors = useCallback(
    async (page = 1) => {
      setError(null);
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12',
        });

        if (searchTerm.trim()) {
          params.append('q', searchTerm.trim());
        }
        if (selectedSpecialty !== 'All Specialties') {
          params.append('specialty', selectedSpecialty);
        }
        if (city.trim()) {
          params.append('city', city.trim());
        }
        if (state.trim()) {
          params.append('state', state.trim());
        }
        if (minRating) {
          params.append('minRating', minRating);
        }

        const data = await fetchJson<DoctorsResponse>(
          `/api/v1/doctors?${params.toString()}`
        );
        setDoctors(data.doctors);
        setPagination(data.pagination);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Failed to load doctors';
        setError(message);

        toast({
          title: 'Failed to Load Doctors',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, selectedSpecialty, city, state, minRating, toast]
  );

  useEffect(() => {
    void loadDoctors(1);
  }, [loadDoctors]);

  const handleSearch = () => {
    void loadDoctors(1);
  };

  const handlePageChange = (newPage: number) => {
    void loadDoctors(newPage);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Find Medical Specialists
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search our directory of verified medical professionals and connect
            with specialists in your area.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, location, or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="pl-10"
              >
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty === 'All Specialties'
                      ? 'All Specialties'
                      : specialty
                          .replace('_', ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <Select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="0">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </Select>
          </div>

          {!isLoading && !error && pagination.total > 0 && (
            <div className="text-center text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total} doctors
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <DoctorCardSkeleton key={i} />
              ))}

            {!isLoading && error && (
              <div className="col-span-full text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {!isLoading &&
              !error &&
              (doctors.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No doctors found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search criteria or filters to find more
                    doctors.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSpecialty('All Specialties');
                      setCity('');
                      setState('');
                      setMinRating('');
                      void loadDoctors(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                doctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))
              ))}
          </div>

          {!isLoading && !error && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex space-x-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i;
                    if (pageNum > pagination.totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === pagination.page ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
