import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { build } from '../test-utils';
import { User } from '../database/models/User';
import { AuditLog } from '../database/models/AuditLog';

describe('Admin Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await build();
  });

  describe('GET /api/v1/admin/audit', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/audit',
      });

      expect(response.statusCode).toBe(401);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Unauthorized',
      });
    });

    it('should return 403 for non-admin users', async () => {
      // Create a patient user
      const patient = new User({
        username: 'patient1',
        email: 'patient1@example.com',
        password: 'password123',
        role: 'patient',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
      await patient.save();

      // Mock session
      const session = { userId: patient._id.toString() };
      vi.spyOn(app, 'sessionStore', 'get').mockReturnValue({
        get: vi.fn().mockResolvedValue(session),
        set: vi.fn(),
        destroy: vi.fn(),
      } as any);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/audit',
        headers: {
          cookie: 'sessionId=test-session',
        },
      });

      expect(response.statusCode).toBe(403);
      expect(JSON.parse(response.body)).toEqual({
        error: 'Access denied. Admin role required.',
      });
    });

    it('should return audit logs for admin users', async () => {
      // Create an admin user
      const admin = new User({
        username: 'admin1',
        email: 'admin1@example.com',
        password: 'password123',
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
        },
      });
      await admin.save();

      // Create some audit logs
      const auditLog1 = new AuditLog({
        action: 'user_registered',
        actorId: admin._id.toString(),
        actorRole: 'admin',
        targetId: admin._id.toString(),
        targetType: 'User',
        timestamp: new Date(),
        details: { email: 'test@example.com' },
      });
      await auditLog1.save();

      const auditLog2 = new AuditLog({
        action: 'subscription_approved',
        actorId: admin._id.toString(),
        actorRole: 'admin',
        targetId: 'subscription123',
        targetType: 'Subscription',
        timestamp: new Date(),
      });
      await auditLog2.save();

      // Mock session
      const session = { userId: admin._id.toString() };
      vi.spyOn(app, 'sessionStore', 'get').mockReturnValue({
        get: vi.fn().mockResolvedValue(session),
        set: vi.fn(),
        destroy: vi.fn(),
      } as any);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/audit?limit=10',
        headers: {
          cookie: 'sessionId=test-session',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.logs).toHaveLength(2);
      expect(data.total).toBe(2);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(10);
      expect(data.logs[0].action).toBe('subscription_approved');
      expect(data.logs[1].action).toBe('user_registered');
    });

    it('should filter audit logs by action', async () => {
      // Create an admin user
      const admin = new User({
        username: 'admin2',
        email: 'admin2@example.com',
        password: 'password123',
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
        },
      });
      await admin.save();

      // Create audit logs with different actions
      const auditLog1 = new AuditLog({
        action: 'user_registered',
        actorId: admin._id.toString(),
        actorRole: 'admin',
        targetId: admin._id.toString(),
        targetType: 'User',
        timestamp: new Date(),
      });
      await auditLog1.save();

      const auditLog2 = new AuditLog({
        action: 'subscription_approved',
        actorId: admin._id.toString(),
        actorRole: 'admin',
        targetId: 'subscription123',
        targetType: 'Subscription',
        timestamp: new Date(),
      });
      await auditLog2.save();

      // Mock session
      const session = { userId: admin._id.toString() };
      vi.spyOn(app, 'sessionStore', 'get').mockReturnValue({
        get: vi.fn().mockResolvedValue(session),
        set: vi.fn(),
        destroy: vi.fn(),
      } as any);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/audit?action=user_registered',
        headers: {
          cookie: 'sessionId=test-session',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.logs).toHaveLength(1);
      expect(data.logs[0].action).toBe('user_registered');
    });

    it('should handle pagination correctly', async () => {
      // Create an admin user
      const admin = new User({
        username: 'admin3',
        email: 'admin3@example.com',
        password: 'password123',
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
        },
      });
      await admin.save();

      // Create multiple audit logs
      for (let i = 0; i < 5; i++) {
        const auditLog = new AuditLog({
          action: 'user_registered',
          actorId: admin._id.toString(),
          actorRole: 'admin',
          targetId: `user${i}`,
          targetType: 'User',
          timestamp: new Date(Date.now() - i * 1000), // Different timestamps
        });
        await auditLog.save();
      }

      // Mock session
      const session = { userId: admin._id.toString() };
      vi.spyOn(app, 'sessionStore', 'get').mockReturnValue({
        get: vi.fn().mockResolvedValue(session),
        set: vi.fn(),
        destroy: vi.fn(),
      } as any);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/audit?limit=2&page=1',
        headers: {
          cookie: 'sessionId=test-session',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.logs).toHaveLength(2);
      expect(data.total).toBe(5);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(2);
    });
  });
});
