import { describe, it, expect, beforeEach } from 'vitest';
import { UserDAO } from './UserDAO';
import { User } from '../models/User';

describe('UserDAO', () => {
  beforeEach(async () => {
    // Clear all users before each test
    await User.deleteMany({});
  });

  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'patient' as const,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      const user = await UserDAO.createUser(userData);

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('patient');
      expect(user.profile.firstName).toBe('John');
      expect(user.profile.lastName).toBe('Doe');
    });

    it('should throw error for invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        role: 'patient' as const,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      await expect(UserDAO.createUser(userData)).rejects.toThrow(
        'Validation error'
      );
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'patient' as const,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      await UserDAO.createUser(userData);

      await expect(UserDAO.createUser(userData)).rejects.toThrow(
        'User with this email or username already exists'
      );
    });

    it('should throw error for short password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
        role: 'patient' as const,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      await expect(UserDAO.createUser(userData)).rejects.toThrow(
        'Validation error'
      );
    });
  });

  describe('findById', () => {
    it('should find user by valid ID', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
      await user.save();

      const foundUser = await UserDAO.findById(user._id.toString());

      expect(foundUser).toBeDefined();
      expect(foundUser?.username).toBe('testuser');
    });

    it('should return null for non-existent ID', async () => {
      const foundUser = await UserDAO.findById('507f1f77bcf86cd799439011');

      expect(foundUser).toBeNull();
    });

    it('should throw error for invalid ID format', async () => {
      await expect(UserDAO.findById('invalid-id')).rejects.toThrow(
        'Invalid user ID format'
      );
    });
  });

  describe('findByEmail', () => {
    it('should find user by valid email', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
      await user.save();

      const foundUser = await UserDAO.findByEmail('test@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.username).toBe('testuser');
    });

    it('should throw error for invalid email format', async () => {
      await expect(UserDAO.findByEmail('invalid-email')).rejects.toThrow(
        'Invalid email format'
      );
    });
  });

  describe('updateUser', () => {
    it('should update user with valid data', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
      await user.save();

      const updatedUser = await UserDAO.updateUser(user._id.toString(), {
        profile: {
          firstName: 'Jane',
        },
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.profile.firstName).toBe('Jane');
      expect(updatedUser?.profile.lastName).toBe('Doe'); // Should remain unchanged
    });

    it('should throw error for duplicate email on update', async () => {
      const user1 = new User({
        username: 'testuser1',
        email: 'test1@example.com',
        password: 'password123',
        role: 'patient',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
      await user1.save();

      const user2 = new User({
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123',
        role: 'patient',
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
        },
      });
      await user2.save();

      await expect(
        UserDAO.updateUser(user2._id.toString(), {
          email: 'test1@example.com',
        })
      ).rejects.toThrow('Email or username already exists');
    });
  });

  describe('findByRole', () => {
    it('should find users by role with pagination', async () => {
      // Create test users
      const patient1 = new User({
        username: 'patient1',
        email: 'patient1@example.com',
        password: 'password123',
        role: 'patient',
        profile: {
          firstName: 'Patient',
          lastName: 'One',
        },
      });
      await patient1.save();

      const patient2 = new User({
        username: 'patient2',
        email: 'patient2@example.com',
        password: 'password123',
        role: 'patient',
        profile: {
          firstName: 'Patient',
          lastName: 'Two',
        },
      });
      await patient2.save();

      const doctor = new User({
        username: 'doctor1',
        email: 'doctor1@example.com',
        password: 'password123',
        role: 'doctor',
        profile: {
          firstName: 'Doctor',
          lastName: 'One',
        },
      });
      await doctor.save();

      const result = await UserDAO.findByRole('patient', 1, 10);

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('searchUsers', () => {
    it('should search users by query', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
      await user.save();

      const result = await UserDAO.searchUsers('John');

      expect(result.users).toHaveLength(1);
      expect(result.users[0].profile.firstName).toBe('John');
    });

    it('should throw error for empty search query', async () => {
      await expect(UserDAO.searchUsers('')).rejects.toThrow('Validation error');
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      // Create test users
      const patient = new User({
        username: 'patient1',
        email: 'patient1@example.com',
        password: 'password123',
        role: 'patient',
        profile: {
          firstName: 'Patient',
          lastName: 'One',
        },
        isActive: true,
        emailVerified: true,
      });
      await patient.save();

      const doctor = new User({
        username: 'doctor1',
        email: 'doctor1@example.com',
        password: 'password123',
        role: 'doctor',
        profile: {
          firstName: 'Doctor',
          lastName: 'One',
        },
        isActive: false,
        emailVerified: false,
      });
      await doctor.save();

      const stats = await UserDAO.getUserStats();

      expect(stats.total).toBe(2);
      expect(stats.byRole.patient).toBe(1);
      expect(stats.byRole.doctor).toBe(1);
      expect(stats.active).toBe(1);
      expect(stats.verified).toBe(1);
    });
  });
});
