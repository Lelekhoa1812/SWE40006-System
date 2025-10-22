import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Message } from '../database/models/Message';
import { Subscription } from '../database/models/Subscription';
import { authMiddleware } from './auth';

// Zod schemas for validation
const getMessagesSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

const sendMessageSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  content: z
    .string()
    .min(1)
    .max(2000, 'Message content must be between 1 and 2000 characters'),
  messageType: z.enum(['text', 'image', 'file', 'system']).default('text'),
});

// Helper function to check if user can access subscription
async function assertCanChat(
  userId: string,
  subscriptionId: string
): Promise<void> {
  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    $or: [{ patientId: userId }, { doctorId: userId }],
    status: 'approved',
  });

  if (!subscription) {
    throw new Error('Access denied to this subscription');
  }
}

export async function messageRoutes(fastify: FastifyInstance) {
  // Get message history
  fastify.get(
    '/api/v1/messages/:subscriptionId',
    { preHandler: authMiddleware },
    async (
      request: FastifyRequest<{
        Params: { subscriptionId: string };
        Querystring: { limit?: string; offset?: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const userId = request.user!.id;
        const { subscriptionId } = request.params;
        const { limit, offset } = getMessagesSchema.parse({
          subscriptionId,
          limit: request.query.limit,
          offset: request.query.offset,
        });

        // Check access
        await assertCanChat(userId, subscriptionId);

        // Get messages
        const messages = await Message.find({ subscriptionId })
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .lean();

        const totalCount = await Message.countDocuments({ subscriptionId });

        request.log.info(
          {
            endpoint: '/api/v1/messages/:subscriptionId',
            action: 'get_messages',
            userId,
            subscriptionId,
            count: messages.length,
          },
          'Retrieved message history'
        );

        reply.send({
          messages: messages.reverse(),
          pagination: {
            total: totalCount,
            limit,
            offset,
            hasMore: offset + limit < totalCount,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: 'Validation error',
            details: error.errors,
          });
        }

        if (
          error instanceof Error &&
          error.message === 'Access denied to this subscription'
        ) {
          return reply.code(403).send({
            error: 'Access denied to this subscription',
          });
        }

        request.log.error(
          {
            endpoint: '/api/v1/messages/:subscriptionId',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Error retrieving messages'
        );

        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Send message (REST endpoint - for fallback)
  fastify.post(
    '/api/v1/messages',
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user!.id;
        const body = sendMessageSchema.parse(request.body);
        const { subscriptionId, content, messageType } = body;

        // Check access
        await assertCanChat(userId, subscriptionId);

        // Get subscription to determine recipient
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
          return reply.code(404).send({ error: 'Subscription not found' });
        }

        const toUserId =
          subscription.patientId === userId
            ? subscription.doctorId
            : subscription.patientId;

        // Create message
        const message = new Message({
          subscriptionId,
          fromUserId: userId,
          toUserId,
          content,
          messageType,
          status: 'sent',
        });

        await message.save();

        request.log.info(
          {
            endpoint: '/api/v1/messages',
            action: 'send_message',
            userId,
            subscriptionId,
            messageId: message._id.toString(),
          },
          'Message sent via REST API'
        );

        reply.code(201).send({
          message: 'Message sent successfully',
          data: {
            id: message._id.toString(),
            subscriptionId: message.subscriptionId,
            fromUserId: message.fromUserId,
            toUserId: message.toUserId,
            content: message.content,
            messageType: message.messageType,
            status: message.status,
            createdAt: message.createdAt,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: 'Validation error',
            details: error.errors,
          });
        }

        if (
          error instanceof Error &&
          error.message === 'Access denied to this subscription'
        ) {
          return reply.code(403).send({
            error: 'Access denied to this subscription',
          });
        }

        request.log.error(
          {
            endpoint: '/api/v1/messages',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Error sending message'
        );

        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Mark message as read
  fastify.patch(
    '/api/v1/messages/:messageId/read',
    { preHandler: authMiddleware },
    async (
      request: FastifyRequest<{ Params: { messageId: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const userId = request.user!.id;
        const { messageId } = request.params;

        const message = await Message.findById(messageId);
        if (!message) {
          return reply.code(404).send({ error: 'Message not found' });
        }

        // Verify user is the recipient
        if (message.toUserId !== userId) {
          return reply.code(403).send({ error: 'Access denied' });
        }

        // Update message status
        message.status = 'read';
        await message.save();

        request.log.info(
          {
            endpoint: '/api/v1/messages/:messageId/read',
            action: 'mark_message_read',
            userId,
            messageId,
          },
          'Message marked as read'
        );

        reply.send({
          message: 'Message marked as read',
          data: {
            messageId,
            status: 'read',
            readBy: userId,
          },
        });
      } catch (error) {
        request.log.error(
          {
            endpoint: '/api/v1/messages/:messageId/read',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Error marking message as read'
        );

        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );
}
