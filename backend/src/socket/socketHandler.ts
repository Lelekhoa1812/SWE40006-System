import { Server as SocketIOServer } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { Message } from '../database/models/Message';
import { Subscription } from '../database/models/Subscription';
import { User } from '../database/models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface Socket {
  id: string;
  userId?: string;
  userRole?: string;
  join: (room: string) => void;
  leave: (room: string) => void;
  to: (room: string) => any;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  handshake: {
    auth: {
      token?: string;
    };
  };
}

export function setupSocketIO(fastify: FastifyInstance) {
  const io = new SocketIOServer(fastify.server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://medmsg-frontend.azurewebsites.net',
      ],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // Get session from cookie
      const sessionId = socket.handshake.auth.sessionId;
      if (!sessionId) {
        return next(new Error('Authentication required'));
      }

      // In a real implementation, you would validate the session
      // For now, we'll extract user info from the session
      // This is a simplified version - in production, use proper session validation
      const session = await fastify.sessionStore.get(sessionId);
      if (!session || !session.userId) {
        return next(new Error('Invalid session'));
      }

      const user = await User.findById(session.userId).select('role');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = session.userId;
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    fastify.log.info(
      { userId: socket.userId, socketId: socket.id },
      'User connected to socket'
    );

    // Join room for a subscription
    socket.on('join_room', async (data: { subscriptionId: string }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        const { subscriptionId } = data;

        // Verify user has access to this subscription
        const subscription = await Subscription.findOne({
          _id: subscriptionId,
          $or: [{ patientId: socket.userId }, { doctorId: socket.userId }],
          status: 'approved',
        });

        if (!subscription) {
          socket.emit('error', {
            message: 'Access denied to this subscription',
          });
          return;
        }

        const roomName = `subscription_${subscriptionId}`;
        socket.join(roomName);

        fastify.log.info(
          { userId: socket.userId, subscriptionId, roomName },
          'User joined subscription room'
        );

        // Send message history
        const messages = await Message.find({ subscriptionId })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        socket.emit('message_history', {
          subscriptionId,
          messages: messages.reverse(),
        });
      } catch (error) {
        fastify.log.error(error, 'Error joining room');
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Send message
    socket.on(
      'message_send',
      async (data: {
        subscriptionId: string;
        content: string;
        messageType?: 'text' | 'image' | 'file' | 'system';
      }) => {
        try {
          if (!socket.userId) {
            socket.emit('error', { message: 'Authentication required' });
            return;
          }

          const { subscriptionId, content, messageType = 'text' } = data;

          // Verify user has access to this subscription
          const subscription = await Subscription.findOne({
            _id: subscriptionId,
            $or: [{ patientId: socket.userId }, { doctorId: socket.userId }],
            status: 'approved',
          });

          if (!subscription) {
            socket.emit('error', {
              message: 'Access denied to this subscription',
            });
            return;
          }

          // Determine recipient
          const toUserId =
            subscription.patientId === socket.userId
              ? subscription.doctorId
              : subscription.patientId;

          // Create message
          const message = new Message({
            subscriptionId,
            fromUserId: socket.userId,
            toUserId,
            content,
            messageType,
            status: 'sent',
          });

          await message.save();

          // Emit to room
          const roomName = `subscription_${subscriptionId}`;
          io.to(roomName).emit('message_received', {
            id: message._id.toString(),
            subscriptionId,
            fromUserId: socket.userId,
            toUserId,
            content,
            messageType,
            status: 'sent',
            createdAt: message.createdAt,
          });

          // Update message status to delivered
          message.status = 'delivered';
          await message.save();

          io.to(roomName).emit('message_delivered', {
            messageId: message._id.toString(),
            status: 'delivered',
          });

          fastify.log.info(
            {
              userId: socket.userId,
              subscriptionId,
              messageId: message._id.toString(),
            },
            'Message sent and delivered'
          );
        } catch (error) {
          fastify.log.error(error, 'Error sending message');
          socket.emit('error', { message: 'Failed to send message' });
        }
      }
    );

    // Mark message as read
    socket.on('message_read', async (data: { messageId: string }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        const { messageId } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Verify user is the recipient
        if (message.toUserId !== socket.userId) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Update message status
        message.status = 'read';
        await message.save();

        // Emit to room
        const roomName = `subscription_${message.subscriptionId}`;
        io.to(roomName).emit('message_read', {
          messageId,
          status: 'read',
          readBy: socket.userId,
        });

        fastify.log.info(
          { userId: socket.userId, messageId },
          'Message marked as read'
        );
      } catch (error) {
        fastify.log.error(error, 'Error marking message as read');
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      fastify.log.info(
        { userId: socket.userId, socketId: socket.id },
        'User disconnected from socket'
      );
    });
  });

  return io;
}
