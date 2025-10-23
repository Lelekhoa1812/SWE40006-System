import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import { healthRoutes } from './routes/health.js';
import { doctorRoutes } from './routes/doctors.js';
import { subscriptionRoutes } from './routes/subscriptions.js';
import { messageRoutes } from './routes/messages.js';
import { env } from './env.js';

const fastify = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Add request logging
fastify.addHook('onRequest', async (request) => {
  request.log.info(
    {
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    },
    'Incoming request'
  );
});

fastify.addHook('onResponse', async (request, reply) => {
  request.log.info(
    {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime(),
    },
    'Request completed'
  );
});

// Register CORS
fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    'https://medmsg-frontend.azurewebsites.net',
  ],
  credentials: true,
});

// Socket.io server
const io = new Server(fastify.server, {
  cors: { origin: ['http://localhost:3000'], credentials: true },
});

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  socket.on('joinRoom', (doctorId: string) =>
    socket.join(`doctor-${doctorId}`)
  );

  socket.on('sendMessage', ({ doctorId, message, sender }) => {
    io.to(`doctor-${doctorId}`).emit('receiveMessage', {
      message,
      sender,
      timestamp: new Date().toISOString(),
    });
  });
});

// Register routes
fastify.register(healthRoutes, { prefix: '' });
fastify.register(authRoutes, { prefix: '/api/v1/auth' });
fastify.register(doctorRoutes, { prefix: '/api/v1' });
fastify.register(subscriptionRoutes, { prefix: '/api/v1' });
fastify.register(messageRoutes, { prefix: '/api/v1' });

const start = async (): Promise<void> => {
  try {
    // Connect to database
    await connectToDatabase(fastify.log);

    const port = env.PORT;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
