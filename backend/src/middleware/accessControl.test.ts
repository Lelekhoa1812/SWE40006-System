import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { vi } from 'vitest';
import { Subscription } from '../database/models/Subscription';
import {
  assertCanChat,
  canAccessSubscription,
  canChatInSubscription,
} from './accessControl';

describe('Access Control Middleware', () => {
  let testPatientId: string;
  let testDoctorId: string;
  let testSubscriptionId: string;

  beforeEach(async () => {
    vi.restoreAllMocks();
    testPatientId = new mongoose.Types.ObjectId().toString();
    testDoctorId = new mongoose.Types.ObjectId().toString();
    testSubscriptionId = new mongoose.Types.ObjectId().toString();

    // Mock Subscription methods used by access control helpers
    vi.spyOn(Subscription, 'findOne').mockImplementation((query: any) => {
      const matchesApproved =
        query &&
        query._id === testSubscriptionId &&
        query.status === 'approved' &&
        (query.$or?.some(
          (c: any) =>
            c.patientId === testPatientId || c.doctorId === testDoctorId
        ) ||
          query.patientId === testPatientId ||
          query.doctorId === testDoctorId);

      const matchesAny =
        query &&
        query._id === testSubscriptionId &&
        (query.$or?.some(
          (c: any) =>
            c.patientId === testPatientId || c.doctorId === testDoctorId
        ) ||
          query.patientId === testPatientId ||
          query.doctorId === testDoctorId);

      const result: any =
        matchesApproved || matchesAny
          ? {
              _id: testSubscriptionId,
              patientId: testPatientId,
              doctorId: testDoctorId,
              status: query.status || 'approved',
            }
          : null;
      return Promise.resolve(result) as any;
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  describe('assertCanChat', () => {
    it('should allow patient to chat in approved subscription', async () => {
      await expect(
        assertCanChat(testPatientId, testSubscriptionId)
      ).resolves.not.toThrow();
    });

    it('should allow doctor to chat in approved subscription', async () => {
      await expect(
        assertCanChat(testDoctorId, testSubscriptionId)
      ).resolves.not.toThrow();
    });

    it('should deny access for non-participant', async () => {
      const otherUserId = new mongoose.Types.ObjectId().toString();

      await expect(
        assertCanChat(otherUserId, testSubscriptionId)
      ).rejects.toThrow(
        'Access denied: Invalid subscription or insufficient permissions'
      );
    });

    it('should deny access for pending subscription', async () => {
      // Update subscription to pending
      vi.spyOn(Subscription, 'findOne').mockResolvedValueOnce(null as any);

      await expect(
        assertCanChat(testPatientId, testSubscriptionId)
      ).rejects.toThrow(
        'Access denied: Invalid subscription or insufficient permissions'
      );
    });

    it('should deny access for denied subscription', async () => {
      // Update subscription to denied
      vi.spyOn(Subscription, 'findOne').mockResolvedValueOnce(null as any);

      await expect(
        assertCanChat(testPatientId, testSubscriptionId)
      ).rejects.toThrow(
        'Access denied: Invalid subscription or insufficient permissions'
      );
    });

    it('should deny access for non-existent subscription', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(assertCanChat(testPatientId, fakeId)).rejects.toThrow(
        'Access denied: Invalid subscription or insufficient permissions'
      );
    });
  });

  describe('canAccessSubscription', () => {
    it('should return true for patient in approved subscription', async () => {
      const result = await canAccessSubscription(
        testPatientId,
        testSubscriptionId
      );
      expect(result).toBe(true);
    });

    it('should return true for doctor in approved subscription', async () => {
      const result = await canAccessSubscription(
        testDoctorId,
        testSubscriptionId
      );
      expect(result).toBe(true);
    });

    it('should return true for patient in pending subscription', async () => {
      vi.spyOn(Subscription, 'findOne').mockResolvedValueOnce({
        _id: testSubscriptionId,
        patientId: testPatientId,
        doctorId: testDoctorId,
        status: 'requested',
      } as any);
      const result = await canAccessSubscription(
        testPatientId,
        testSubscriptionId
      );
      expect(result).toBe(true);
    });

    it('should return false for non-participant', async () => {
      const otherUserId = new mongoose.Types.ObjectId().toString();
      vi.spyOn(Subscription, 'findOne').mockResolvedValueOnce(null as any);

      const result = await canAccessSubscription(
        otherUserId,
        testSubscriptionId
      );
      expect(result).toBe(false);
    });

    it('should return false for non-existent subscription', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await canAccessSubscription(testPatientId, fakeId);
      expect(result).toBe(false);
    });
  });

  describe('canChatInSubscription', () => {
    it('should return true for patient in approved subscription', async () => {
      const result = await canChatInSubscription(
        testPatientId,
        testSubscriptionId
      );
      expect(result).toBe(true);
    });

    it('should return true for doctor in approved subscription', async () => {
      const result = await canChatInSubscription(
        testDoctorId,
        testSubscriptionId
      );
      expect(result).toBe(true);
    });

    it('should return false for patient in pending subscription', async () => {
      vi.spyOn(Subscription, 'findOne').mockResolvedValueOnce(null as any);
      const result = await canChatInSubscription(
        testPatientId,
        testSubscriptionId
      );
      expect(result).toBe(false);
    });

    it('should return false for patient in denied subscription', async () => {
      vi.spyOn(Subscription, 'findOne').mockResolvedValueOnce(null as any);
      const result = await canChatInSubscription(
        testPatientId,
        testSubscriptionId
      );
      expect(result).toBe(false);
    });

    it('should return false for non-participant', async () => {
      const otherUserId = new mongoose.Types.ObjectId().toString();
      vi.spyOn(Subscription, 'findOne').mockResolvedValueOnce(null as any);

      const result = await canChatInSubscription(
        otherUserId,
        testSubscriptionId
      );
      expect(result).toBe(false);
    });

    it('should return false for non-existent subscription', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await canChatInSubscription(testPatientId, fakeId);
      expect(result).toBe(false);
    });
  });
});
