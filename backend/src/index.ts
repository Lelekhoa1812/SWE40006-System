import Fastify from 'fastify';
import cors from '@fastify/cors';
import session from '@fastify/session';
import MongoStore from 'connect-mongo';
import { healthRoutes } from './routes/health';
import { doctorRoutes } from './routes/doctors';
import { subscriptionRoutes } from './routes/subscriptions';
import { messageRoutes } from './routes/messages';
import { authRoutes } from './routes/auth';
import { env } from './env';
import { connectToDatabase } from './database/connection';

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

// Register session
fastify.register(session, {
  secret: env.SESSION_SECRET,
  cookie: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  store: MongoStore.create({
    mongoUrl: env.MONGODB_URI,
  }),
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
