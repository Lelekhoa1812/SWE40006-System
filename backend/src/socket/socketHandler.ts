import { Server as SocketIOServer } from 'socket.io';
import fastify, { FastifyInstance } from 'fastify';
import { Message } from '../database/models/Message';
import { Subscription } from '../database/models/Subscription';

export async function setupSocketIO(fastify: FastifyInstance) {
  const io = new SocketIOServer(fastify.server as any, {
    cors: {
      origin: ['https://medmsg-frontend.azurewebsites.net', 'http://localhost:3000'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      // Get session from cookie
      const sessionId = socket.handshake.headers.cookie
        ?.split(';')
        .find(c => c.trim().startsWith('sessionId='))
        ?.split('=')[1];

      if (!sessionId) {
        return next(new Error('No session found'));
      }

      // You would need to implement session validation here
      // For now, we'll allow all connections
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join subscription room
    socket.on('join_room', async (subscriptionId) => {
      try {
        // Verify user has access to this subscription
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
          socket.emit('error', { message: 'Subscription not found' });
          return;
        }

        socket.join(subscriptionId);
        socket.emit('joined_room', { subscriptionId });

        // Send recent messages
        const messages = await Message.find({ subscriptionId })
          .populate('fromUserId', 'username email')
          .populate('toUserId', 'username email')
          .sort({ createdAt: -1 })
          .limit(50);

        socket.emit('message_history', messages.reverse());
      } catch (error) {
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle new message
    socket.on('message_send', async (data) => {
      try {
        const { subscriptionId, content, messageType = 'text' } = data;

        // Verify user has access to this subscription
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
          socket.emit('error', { message: 'Subscription not found' });
          return;
        }

        // Create message
        const message = new Message({
          subscriptionId,
          fromUserId: data.userId,
          toUserId: subscription.patientId.toString() === data.userId
            ? subscription.doctorId
            : subscription.patientId,
          content,
          messageType,
          status: 'sent',
        });

        await message.save();

        // Broadcast to room
        io.to(subscriptionId).emit('message_received', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message delivered
    socket.on('message_delivered', async (messageId) => {
      try {
        await Message.findByIdAndUpdate(messageId, { status: 'delivered' });
        socket.broadcast.emit('message_delivered', { messageId });
      } catch (error) {
        console.error('Failed to mark message as delivered:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}
