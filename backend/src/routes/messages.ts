import { FastifyInstance, FastifyRequest } from 'fastify';
import { ObjectId } from 'mongodb';
import { getDb } from '../database/client';
import { z } from 'zod';

const messageBodySchema = z.object({
  fromUserId: z.string().min(1, 'fromUserId is required'),
  toUserId: z.string().min(1, 'toUserId is required'),
  subscriptionId: z.string().min(1, 'subscriptionId is required'),
  body: z.string().min(1, 'Message body cannot be empty'),
});

export async function messageRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/messages',
    async (
      request: FastifyRequest<{ Body: z.infer<typeof messageBodySchema> }>,
      reply
    ) => {
      try {
        const { fromUserId, toUserId, subscriptionId, body } = request.body;
        const db = await getDb();
        const messages = db.collection('messages');

        const newMessage = {
          from_user_id: new ObjectId(fromUserId),
          to_user_id: new ObjectId(toUserId),
          subscription_id: new ObjectId(subscriptionId),
          body: body,
          created_at: new Date(),
        };

        const result = await messages.insertOne(newMessage);

        reply.code(201).send({
          message: 'Message saved successfully.',
          messageId: result.insertedId,
        });
      } catch (error) {
        fastify.log.error(error, 'Failed to save message');
        reply
          .code(500)
          .send({ message: 'An error occurred while saving the message.' });
      }
    }
  );
}
