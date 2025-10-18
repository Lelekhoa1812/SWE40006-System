import { expect, describe, vi, beforeEach, it } from 'vitest';
import Fastify from 'fastify';
import { subscriptionRoutes } from './subscriptions';
import { getDb } from '../database/client';
import { ObjectId } from 'mongodb';

vi.mock('../database/client', () => {
  const mockDb = {
    collection: vi.fn().mockReturnThis(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
  };
  return {
    getDb: vi.fn(() => Promise.resolve(mockDb)),
  };
});

const mockedGetDb = vi.mocked(getDb);

describe('Subscription API Routes', () => {
  let app: any;

  beforeEach(async () => {
    app = Fastify();
    app.register(subscriptionRoutes, { prefix: '/api/v1' });
    await app.ready();

    vi.clearAllMocks();
  });

  //--Test for subscription request endpoint--
  describe('POST /api/v1/subscriptions/request', () => {
    it('should return 201 Created and request a subscription successfully', async () => {
      const patientId = new ObjectId().toHexString();
      const doctorId = new ObjectId().toHexString();
      const mockInsertId = new ObjectId();

      const mockDb = await mockedGetDb();
      (mockDb.collection('subscriptions').insertOne as any).mockResolvedValue({
        acknowledged: true,
        insertedId: mockInsertId,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/subscriptions/request',
        payload: {
          patientId,
          doctorId,
        },
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.payload).message).toBe(
        'Subscription requested successfully.'
      );

      expect(mockDb.collection('subscriptions').insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'requested',
        })
      );
    });

    it('should return 400 Bad request if doctorId is missing', async () => {
      const patientId = new ObjectId().toHexString();

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/subscriptions/request',
        payload: {
          patientId,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  //--Test for subscription approve endpoint--
  describe('PUT /api/v1/subscriptions/approve', () => {
    it('should return 200 OK and approve the subscription successfully', async () => {
      const subscriptionId = new ObjectId().toHexString();
      const mockDb = await mockedGetDb();
      (mockDb.collection('subscriptions').updateOne as any).mockResolvedValue({
        matchedCount: 1,
        modifiedCount: 1,
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/subscriptions/approve',
        payload: {
          subscriptionId,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload).message).toBe(
        'Subscription status updated to approved.'
      );

      expect(mockDb.collection('subscriptions').updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(subscriptionId) },
        { $set: { status: 'approved' } }
      );
    });

    it('should return 404 Not Found if subscription does not exist', async () => {
      const subscriptionId = new ObjectId().toHexString();
      const mockDb = await mockedGetDb();
      (mockDb.collection('subscriptions').updateOne as any).mockResolvedValue({
        matchedCount: 0,
        modifiedCount: 0,
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/subscriptions/approve',
        payload: {
          subscriptionId,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.payload).message).toBe(
        'Subscription not found.'
      );
    });
  });

  //--Test for subscription deny endpoint--
  describe('PUT /api/v1/subscriptions/deny', () => {
    it('should return 200 OK and deny the subscription successfully', async () => {
      const subscriptionId = new ObjectId().toHexString();
      const mockDb = await mockedGetDb();
      (mockDb.collection('subscriptions').updateOne as any).mockResolvedValue({
        matchedCount: 1,
        modifiedCount: 1,
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/subscriptions/deny',
        payload: {
          subscriptionId,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload).message).toBe(
        'Subscription status updated to denied.'
      );

      expect(mockDb.collection('subscriptions').updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(subscriptionId) },
        { $set: { status: 'denied' } }
      );
    });
  });
});
