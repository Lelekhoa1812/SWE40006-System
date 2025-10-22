import { User, IUser } from '../models/User';
import { z } from 'zod';

// Validation schemas
const createUserSchema = z.object({
  username: z.string().min(3).max(30).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8),
  role: z.enum(['patient', 'doctor', 'admin']).default('patient'),
  profile: z.object({
    firstName: z.string().min(1).max(50).trim(),
    lastName: z.string().min(1).max(50).trim(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/)
      .optional(),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    avatar: z.string().url().optional(),
  }),
});

const updateUserSchema = z.object({
  username: z.string().min(3).max(30).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  profile: z
    .object({
      firstName: z.string().min(1).max(50).trim().optional(),
      lastName: z.string().min(1).max(50).trim().optional(),
      phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .optional(),
      dateOfBirth: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
      gender: z
        .enum(['male', 'female', 'other', 'prefer_not_to_say'])
        .optional(),
      avatar: z.string().url().optional(),
    })
    .optional(),
});

export class UserDAO {
  /**
   * Create a new user with validation
   */
  static async createUser(
    userData: z.infer<typeof createUserSchema>
  ): Promise<IUser> {
    try {
      const validatedData = createUserSchema.parse(userData);

      // Check for existing user
      const existingUser = await User.findOne({
        $or: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
      });

      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      const user = new User(validatedData);
      await user.save();
      return user;
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
   * Find user by ID with validation
   */
  static async findById(id: string): Promise<IUser | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid user ID');
    }

    try {
      return await User.findById(id).select('-password');
    } catch (error) {
      throw new Error('Invalid user ID format');
    }
  }

  /**
   * Find user by email with validation
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    if (!email || typeof email !== 'string') {
      throw new Error('Invalid email address');
    }

    const emailSchema = z.string().email();
    try {
      const validatedEmail = emailSchema.parse(email.toLowerCase().trim());
      return await User.findOne({ email: validatedEmail });
    } catch (error) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * Find user by username with validation
   */
  static async findByUsername(username: string): Promise<IUser | null> {
    if (!username || typeof username !== 'string') {
      throw new Error('Invalid username');
    }

    const usernameSchema = z.string().min(3).max(30).trim();
    try {
      const validatedUsername = usernameSchema.parse(username);
      return await User.findOne({ username: validatedUsername });
    } catch (error) {
      throw new Error('Invalid username format');
    }
  }

  /**
   * Update user with validation
   */
  static async updateUser(
    id: string,
    updateData: z.infer<typeof updateUserSchema>
  ): Promise<IUser | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid user ID');
    }

    try {
      const validatedData = updateUserSchema.parse(updateData);

      // Check for duplicate email/username if being updated
      if (validatedData.email || validatedData.username) {
        const existingUser = await User.findOne({
          _id: { $ne: id },
          $or: [
            ...(validatedData.email ? [{ email: validatedData.email }] : []),
            ...(validatedData.username
              ? [{ username: validatedData.username }]
              : []),
          ],
        });

        if (existingUser) {
          throw new Error('Email or username already exists');
        }
      }

      return await User.findByIdAndUpdate(id, validatedData, {
        new: true,
        runValidators: true,
      }).select('-password');
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
   * Delete user with validation
   */
  static async deleteUser(id: string): Promise<boolean> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid user ID');
    }

    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error('Invalid user ID format');
    }
  }

  /**
   * Find users by role with pagination
   */
  static async findByRole(
    role: 'patient' | 'doctor' | 'admin',
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: IUser[]; total: number; page: number; limit: number }> {
    const roleSchema = z.enum(['patient', 'doctor', 'admin']);
    const pageSchema = z.number().min(1);
    const limitSchema = z.number().min(1).max(100);

    try {
      const validatedRole = roleSchema.parse(role);
      const validatedPage = pageSchema.parse(page);
      const validatedLimit = limitSchema.parse(limit);

      const skip = (validatedPage - 1) * validatedLimit;

      const [users, total] = await Promise.all([
        User.find({ role: validatedRole })
          .select('-password')
          .skip(skip)
          .limit(validatedLimit)
          .sort({ createdAt: -1 }),
        User.countDocuments({ role: validatedRole }),
      ]);

      return {
        users,
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
   * Search users with validation
   */
  static async searchUsers(
    query: string,
    role?: 'patient' | 'doctor' | 'admin',
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: IUser[]; total: number; page: number; limit: number }> {
    const querySchema = z.string().min(1).max(100).trim();
    const roleSchema = z.enum(['patient', 'doctor', 'admin']).optional();
    const pageSchema = z.number().min(1);
    const limitSchema = z.number().min(1).max(100);

    try {
      const validatedQuery = querySchema.parse(query);
      const validatedRole = role ? roleSchema.parse(role) : undefined;
      const validatedPage = pageSchema.parse(page);
      const validatedLimit = limitSchema.parse(limit);

      const skip = (validatedPage - 1) * validatedLimit;

      const searchFilter: Record<string, unknown> = {
        $or: [
          { username: { $regex: validatedQuery, $options: 'i' } },
          { email: { $regex: validatedQuery, $options: 'i' } },
          { 'profile.firstName': { $regex: validatedQuery, $options: 'i' } },
          { 'profile.lastName': { $regex: validatedQuery, $options: 'i' } },
        ],
      };

      if (validatedRole) {
        searchFilter.role = validatedRole;
      }

      const [users, total] = await Promise.all([
        User.find(searchFilter)
          .select('-password')
          .skip(skip)
          .limit(validatedLimit)
          .sort({ createdAt: -1 }),
        User.countDocuments(searchFilter),
      ]);

      return {
        users,
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
   * Get user statistics
   */
  static async getUserStats(): Promise<{
    total: number;
    byRole: { [key: string]: number };
    active: number;
    verified: number;
  }> {
    try {
      const [total, byRole, active, verified] = await Promise.all([
        User.countDocuments(),
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ emailVerified: true }),
      ]);

      const roleStats = byRole.reduce(
        (acc: Record<string, number>, item: { _id: string; count: number }) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        total,
        byRole: roleStats,
        active,
        verified,
      };
    } catch (error) {
      throw new Error('Failed to get user statistics');
    }
  }
}
