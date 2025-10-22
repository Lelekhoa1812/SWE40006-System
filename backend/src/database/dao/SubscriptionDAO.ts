import { Subscription, ISubscription } from '../models/Subscription';
import { z } from 'zod';

// Validation schemas
const createSubscriptionSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  status: z
    .enum(['requested', 'approved', 'denied', 'cancelled'])
    .default('requested'),
  requestMessage: z.string().max(500).trim().optional(),
  responseMessage: z.string().max(500).trim().optional(),
  requestedAt: z.date().default(() => new Date()),
  respondedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  isActive: z.boolean().default(true),
  metadata: z
    .object({
      consentGiven: z.boolean().default(false),
      consentDate: z.date().optional(),
      privacyPolicyVersion: z.string().trim().optional(),
    })
    .optional(),
});

const updateSubscriptionSchema = z.object({
  status: z.enum(['requested', 'approved', 'denied', 'cancelled']).optional(),
  requestMessage: z.string().max(500).trim().optional(),
  responseMessage: z.string().max(500).trim().optional(),
  respondedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  isActive: z.boolean().optional(),
  metadata: z
    .object({
      consentGiven: z.boolean().optional(),
      consentDate: z.date().optional(),
      privacyPolicyVersion: z.string().trim().optional(),
    })
    .optional(),
});

export class SubscriptionDAO {
  /**
   * Create a new subscription with validation
   */
  static async createSubscription(
    subscriptionData: z.infer<typeof createSubscriptionSchema>
  ): Promise<ISubscription> {
    try {
      const validatedData = createSubscriptionSchema.parse(subscriptionData);

      // Check for existing subscription
      const existingSubscription = await Subscription.findOne({
        patientId: validatedData.patientId,
        doctorId: validatedData.doctorId,
      });

      if (existingSubscription) {
        throw new Error(
          'Subscription already exists between this patient and doctor'
        );
      }

      const subscription = new Subscription(validatedData);
      await subscription.save();
      return subscription;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  /**
   * Find subscription by ID with validation
   */
  static async findById(id: string): Promise<ISubscription | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid subscription ID');
    }

    try {
      return await Subscription.findById(id);
    } catch (error) {
      throw new Error('Invalid subscription ID format');
    }
  }

  /**
   * Find subscription by patient and doctor IDs
   */
  static async findByPatientAndDoctor(
    patientId: string,
    doctorId: string
  ): Promise<ISubscription | null> {
    const idSchema = z.string().min(1);

    try {
      const validatedPatientId = idSchema.parse(patientId);
      const validatedDoctorId = idSchema.parse(doctorId);

      return await Subscription.findOne({
        patientId: validatedPatientId,
        doctorId: validatedDoctorId,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  /**
   * Find subscriptions by patient ID with pagination
   */
  static async findByPatientId(
    patientId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    subscriptions: ISubscription[];
    total: number;
    page: number;
    limit: number;
  }> {
    const idSchema = z.string().min(1);
    const pageSchema = z.number().min(1);
    const limitSchema = z.number().min(1).max(100);

    try {
      const validatedPatientId = idSchema.parse(patientId);
      const validatedPage = pageSchema.parse(page);
      const validatedLimit = limitSchema.parse(limit);

      const skip = (validatedPage - 1) * validatedLimit;

      const [subscriptions, total] = await Promise.all([
        Subscription.find({ patientId: validatedPatientId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(validatedLimit),
        Subscription.countDocuments({ patientId: validatedPatientId }),
      ]);

      return {
        subscriptions,
        total,
        page: validatedPage,
        limit: validatedLimit,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  /**
   * Find subscriptions by doctor ID with pagination
   */
  static async findByDoctorId(
    doctorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    subscriptions: ISubscription[];
    total: number;
    page: number;
    limit: number;
  }> {
    const idSchema = z.string().min(1);
    const pageSchema = z.number().min(1);
    const limitSchema = z.number().min(1).max(100);

    try {
      const validatedDoctorId = idSchema.parse(doctorId);
      const validatedPage = pageSchema.parse(page);
      const validatedLimit = limitSchema.parse(limit);

      const skip = (validatedPage - 1) * validatedLimit;

      const [subscriptions, total] = await Promise.all([
        Subscription.find({ doctorId: validatedDoctorId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(validatedLimit),
        Subscription.countDocuments({ doctorId: validatedDoctorId }),
      ]);

      return {
        subscriptions,
        total,
        page: validatedPage,
        limit: validatedLimit,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  /**
   * Find subscriptions by status with pagination
   */
  static async findByStatus(
    status: 'requested' | 'approved' | 'denied' | 'cancelled',
    page: number = 1,
    limit: number = 10
  ): Promise<{
    subscriptions: ISubscription[];
    total: number;
    page: number;
    limit: number;
  }> {
    const statusSchema = z.enum([
      'requested',
      'approved',
      'denied',
      'cancelled',
    ]);
    const pageSchema = z.number().min(1);
    const limitSchema = z.number().min(1).max(100);

    try {
      const validatedStatus = statusSchema.parse(status);
      const validatedPage = pageSchema.parse(page);
      const validatedLimit = limitSchema.parse(limit);

      const skip = (validatedPage - 1) * validatedLimit;

      const [subscriptions, total] = await Promise.all([
        Subscription.find({ status: validatedStatus })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(validatedLimit),
        Subscription.countDocuments({ status: validatedStatus }),
      ]);

      return {
        subscriptions,
        total,
        page: validatedPage,
        limit: validatedLimit,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  /**
   * Update subscription with validation
   */
  static async updateSubscription(
    id: string,
    updateData: z.infer<typeof updateSubscriptionSchema>
  ): Promise<ISubscription | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid subscription ID');
    }

    try {
      const validatedData = updateSubscriptionSchema.parse(updateData);

      // If status is being updated to approved/denied, set respondedAt
      if (
        validatedData.status &&
        ['approved', 'denied'].includes(validatedData.status)
      ) {
        validatedData.respondedAt = new Date();
      }

      return await Subscription.findByIdAndUpdate(id, validatedData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  /**
   * Approve subscription
   */
  static async approveSubscription(
    id: string,
    responseMessage?: string
  ): Promise<ISubscription | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid subscription ID');
    }

    try {
      const updateData: Record<string, unknown> = {
        status: 'approved',
        respondedAt: new Date(),
      };

      if (responseMessage) {
        updateData.responseMessage = responseMessage;
      }

      return await Subscription.findByIdAndUpdate(id, updateData, {
        new: true,
      });
    } catch (error) {
      throw new Error('Invalid subscription ID format');
    }
  }

  /**
   * Deny subscription
   */
  static async denySubscription(
    id: string,
    responseMessage?: string
  ): Promise<ISubscription | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid subscription ID');
    }

    try {
      const updateData: Record<string, unknown> = {
        status: 'denied',
        respondedAt: new Date(),
      };

      if (responseMessage) {
        updateData.responseMessage = responseMessage;
      }

      return await Subscription.findByIdAndUpdate(id, updateData, {
        new: true,
      });
    } catch (error) {
      throw new Error('Invalid subscription ID format');
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(id: string): Promise<ISubscription | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid subscription ID');
    }

    try {
      return await Subscription.findByIdAndUpdate(
        id,
        {
          status: 'cancelled',
          isActive: false,
          respondedAt: new Date(),
        },
        { new: true }
      );
    } catch (error) {
      throw new Error('Invalid subscription ID format');
    }
  }

  /**
   * Delete subscription with validation
   */
  static async deleteSubscription(id: string): Promise<boolean> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid subscription ID');
    }

    try {
      const result = await Subscription.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error('Invalid subscription ID format');
    }
  }

  /**
   * Get subscription statistics
   */
  static async getSubscriptionStats(): Promise<{
    total: number;
    byStatus: { [key: string]: number };
    active: number;
    pending: number;
    recent: number; // Subscriptions in last 30 days
  }> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [total, byStatus, active, pending, recent] = await Promise.all([
        Subscription.countDocuments(),
        Subscription.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Subscription.countDocuments({ isActive: true }),
        Subscription.countDocuments({ status: 'requested' }),
        Subscription.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        }),
      ]);

      const statusStats = byStatus.reduce(
        (acc: Record<string, number>, item: { _id: string; count: number }) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        total,
        byStatus: statusStats,
        active,
        pending,
        recent,
      };
    } catch (error) {
      throw new Error('Failed to get subscription statistics');
    }
  }

  /**
   * Clean up expired subscriptions (for retention policy)
   */
  static async cleanupExpiredSubscriptions(): Promise<number> {
    try {
      const now = new Date();
      const result = await Subscription.updateMany(
        {
          expiresAt: { $lt: now },
          status: { $in: ['requested', 'approved'] },
        },
        {
          status: 'cancelled',
          isActive: false,
          respondedAt: now,
        }
      );

      return result.modifiedCount || 0;
    } catch (error) {
      throw new Error('Failed to cleanup expired subscriptions');
    }
  }
}
