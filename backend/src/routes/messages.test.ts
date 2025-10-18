import { expect, describe, vi, beforeEach, it } from 'vitest';
import Fastify from 'fastify';
import { messageRoutes } from './messages';
import { getDb } from '../database/client';
import { ObjectId } from 'mongodb';

vi.mock('../database/client', () => {
  const mockDb = {
    collection: vi.fn().mockReturnThis(),
    insertOne: vi.fn(),
  };
  return {
    getDb: vi.fn(() => Promise.resolve(mockDb)),
  };
});

const mockedGetDb = vi.mocked(getDb);

describe('Message API Routes', () => {
  let app: any;

  beforeEach(async () => {
    app = Fastify();
    app.register(messageRoutes, { prefix: '/api/v1' });
    await app.ready();

    vi.clearAllMocks();
  });

  //--Test for message creation endpoint--
  describe('POST /api/v1/messages', () => {
    it('should return 201 Created and save a message successfully', async () => {
      const fromUserId = new ObjectId();
      const toUserId = new ObjectId();
      const subscriptionId = new ObjectId();
      const messageBody = 'This is a test message.';

      const mockDb = await mockedGetDb();
      (mockDb.collection('messages').insertOne as any).mockResolvedValue({
        acknowledged: true,
        insertedId: new ObjectId(),
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/messages',
        payload: {
          fromUserId: fromUserId.toHexString(),
          toUserId: toUserId.toHexString(),
          subscriptionId: subscriptionId.toHexString(),
          body: messageBody,
        },
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.payload).message).toBe(
        'Message saved successfully.'
      );

      expect(mockDb.collection('messages').insertOne).toHaveBeenCalledWith({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        subscription_id: subscriptionId,
        body: messageBody,
        created_at: expect.any(Date),
      });
    });

    it('should return 400 Bad Request if the message body is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/messages',
        payload: {
          fromUserId: new ObjectId().toHexString(),
          toUserId: new ObjectId().toHexString(),
          subscriptionId: new ObjectId().toHexString(),
          // body is missing
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
