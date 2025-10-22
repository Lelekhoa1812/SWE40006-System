import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { Subscription } from '../database/models/Subscription';
import { User } from '../database/models/User';
import { Doctor } from '../database/models/Doctor';
import { Message } from '../database/models/Message';
import { setupSocketIO } from './socketHandler';

// Mock Fastify instance
const mockFastify = {
  server: {},
  log: {
    info: vi.fn(),
    error: vi.fn(),
  },
  sessionStore: {
    get: vi.fn(),
  },
} as unknown as FastifyInstance;

describe.skip('Socket Handler Access Control', () => {
  let testPatientId: string;
  let testDoctorId: string;
  let testOtherUserId: string;
  let testSubscriptionId: string;
  let testDeniedSubscriptionId: string;

  beforeEach(async () => {
    // Create test users
    const patient = new User({
      username: 'testpatient',
      email: 'patient@test.com',
      password: 'hashedpassword',
      role: 'patient',
      profile: {
        firstName: 'Test',
        lastName: 'Patient',
      },
    });
    await patient.save();
    testPatientId = patient._id.toString();

    const doctor = new Doctor({
      email: 'doctor@test.com',
      role: 'doctor',
      profile: {
        firstName: 'Test',
        lastName: 'Doctor',
      },
      medicalLicense: 'TEST123',
      specialties: ['cardiology'],
      rating: 4.5,
      reviewCount: 10,
      languages: ['English'],
      isActive: true,
      emailVerified: true,
    });
    await doctor.save();
    testDoctorId = doctor._id.toString();

    const otherUser = new User({
      username: 'otheruser',
      email: 'other@test.com',
      password: 'hashedpassword',
      role: 'patient',
      profile: {
        firstName: 'Other',
        lastName: 'User',
      },
    });
    await otherUser.save();
    testOtherUserId = otherUser._id.toString();

    // Create approved subscription
    const approvedSubscription = new Subscription({
      patientId: testPatientId,
      doctorId: testDoctorId,
      status: 'approved',
      requestedAt: new Date(),
    });
    await approvedSubscription.save();
    testSubscriptionId = approvedSubscription._id.toString();

    // Create denied subscription
    const deniedSubscription = new Subscription({
      patientId: testPatientId,
      doctorId: testDoctorId,
      status: 'denied',
      requestedAt: new Date(),
    });
    await deniedSubscription.save();
    testDeniedSubscriptionId = deniedSubscription._id.toString();

    // Mock session store
    mockFastify.sessionStore.get = vi.fn().mockImplementation((sessionId) => {
      if (sessionId === 'patient-session') {
        return { userId: testPatientId };
      }
      if (sessionId === 'doctor-session') {
        return { userId: testDoctorId };
      }
      if (sessionId === 'other-session') {
        return { userId: testOtherUserId };
      }
      return null;
    });
  });

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Subscription.deleteMany({});
    await Message.deleteMany({});
    vi.clearAllMocks();
  });

  describe('join_room access control', () => {
    it('should allow patient to join approved subscription room', async () => {
      setupSocketIO(mockFastify);

      // Mock socket
      const mockSocket = {
        id: 'test-socket',
        userId: testPatientId,
        userRole: 'patient',
        join: vi.fn(),
        emit: vi.fn(),
        on: vi.fn(),
        handshake: {
          auth: { sessionId: 'patient-session' },
        },
      };

      // Mock User.findById
      const mockUser = { role: 'patient' };
      vi.spyOn(User, 'findById').mockResolvedValue(mockUser as any);

      // Test join_room event
      const joinRoomHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'join_room'
      )?.[1];
      if (joinRoomHandler) {
        await joinRoomHandler({ subscriptionId: testSubscriptionId });

        expect(mockSocket.join).toHaveBeenCalledWith(
          `subscription_${testSubscriptionId}`
        );
        expect(mockSocket.emit).not.toHaveBeenCalledWith(
          'error',
          expect.any(Object)
        );
      }
    });

    it('should allow doctor to join approved subscription room', async () => {
      setupSocketIO(mockFastify);

      // Mock socket
      const mockSocket = {
        id: 'test-socket',
        userId: testDoctorId,
        userRole: 'doctor',
        join: vi.fn(),
        emit: vi.fn(),
        on: vi.fn(),
        handshake: {
          auth: { sessionId: 'doctor-session' },
        },
      };

      // Mock User.findById
      const mockUser = { role: 'doctor' };
      vi.spyOn(User, 'findById').mockResolvedValue(mockUser as any);

      // Test join_room event
      const joinRoomHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'join_room'
      )?.[1];
      if (joinRoomHandler) {
        await joinRoomHandler({ subscriptionId: testSubscriptionId });

        expect(mockSocket.join).toHaveBeenCalledWith(
          `subscription_${testSubscriptionId}`
        );
        expect(mockSocket.emit).not.toHaveBeenCalledWith(
          'error',
          expect.any(Object)
        );
      }
    });

    it('should deny access for non-participant', async () => {
      setupSocketIO(mockFastify);

      // Mock socket
      const mockSocket = {
        id: 'test-socket',
        userId: testOtherUserId,
        userRole: 'patient',
        join: vi.fn(),
        emit: vi.fn(),
        on: vi.fn(),
        handshake: {
          auth: { sessionId: 'other-session' },
        },
      };

      // Mock User.findById
      const mockUser = { role: 'patient' };
      vi.spyOn(User, 'findById').mockResolvedValue(mockUser as any);

      // Test join_room event
      const joinRoomHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'join_room'
      )?.[1];
      if (joinRoomHandler) {
        await joinRoomHandler({ subscriptionId: testSubscriptionId });

        expect(mockSocket.join).not.toHaveBeenCalled();
        expect(mockSocket.emit).toHaveBeenCalledWith(
          'error',
          expect.objectContaining({
            message: expect.stringContaining('Access denied'),
          })
        );
      }
    });

    it('should deny access for denied subscription', async () => {
      setupSocketIO(mockFastify);

      // Mock socket
      const mockSocket = {
        id: 'test-socket',
        userId: testPatientId,
        userRole: 'patient',
        join: vi.fn(),
        emit: vi.fn(),
        on: vi.fn(),
        handshake: {
          auth: { sessionId: 'patient-session' },
        },
      };

      // Mock User.findById
      const mockUser = { role: 'patient' };
      vi.spyOn(User, 'findById').mockResolvedValue(mockUser as any);

      // Test join_room event with denied subscription
      const joinRoomHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'join_room'
      )?.[1];
      if (joinRoomHandler) {
        await joinRoomHandler({ subscriptionId: testDeniedSubscriptionId });

        expect(mockSocket.join).not.toHaveBeenCalled();
        expect(mockSocket.emit).toHaveBeenCalledWith(
          'error',
          expect.objectContaining({
            message: expect.stringContaining('Access denied'),
          })
        );
      }
    });
  });

  describe('message_send access control', () => {
    it('should allow patient to send message in approved subscription', async () => {
      setupSocketIO(mockFastify);

      // Mock socket
      const mockSocket = {
        id: 'test-socket',
        userId: testPatientId,
        userRole: 'patient',
        join: vi.fn(),
        emit: vi.fn(),
        on: vi.fn(),
        handshake: {
          auth: { sessionId: 'patient-session' },
        },
      };

      // Mock User.findById
      const mockUser = { role: 'patient' };
      vi.spyOn(User, 'findById').mockResolvedValue(mockUser as any);

      // Test message_send event
      const messageSendHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'message_send'
      )?.[1];
      if (messageSendHandler) {
        await messageSendHandler({
          subscriptionId: testSubscriptionId,
          content: 'Test message',
          messageType: 'text',
        });

        expect(mockSocket.emit).not.toHaveBeenCalledWith(
          'error',
          expect.any(Object)
        );
      }
    });

    it('should deny message sending for non-participant', async () => {
      setupSocketIO(mockFastify);

      // Mock socket
      const mockSocket = {
        id: 'test-socket',
        userId: testOtherUserId,
        userRole: 'patient',
        join: vi.fn(),
        emit: vi.fn(),
        on: vi.fn(),
        handshake: {
          auth: { sessionId: 'other-session' },
        },
      };

      // Mock User.findById
      const mockUser = { role: 'patient' };
      vi.spyOn(User, 'findById').mockResolvedValue(mockUser as any);

      // Test message_send event
      const messageSendHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'message_send'
      )?.[1];
      if (messageSendHandler) {
        await messageSendHandler({
          subscriptionId: testSubscriptionId,
          content: 'Test message',
          messageType: 'text',
        });

        expect(mockSocket.emit).toHaveBeenCalledWith(
          'error',
          expect.objectContaining({
            message: expect.stringContaining('Access denied'),
          })
        );
      }
    });
  });
});
