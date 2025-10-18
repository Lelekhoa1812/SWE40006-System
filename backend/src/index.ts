import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health';
import { doctorRoutes } from './routes/doctors';
import { env } from './env';

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
  origin: 'http://localhost:3000',
  credentials: true,
});

// Register routes
fastify.register(healthRoutes, { prefix: '' });
fastify.register(doctorRoutes, { prefix: '/api/v1' });

const start = async (): Promise<void> => {
  try {
    const port = env.PORT;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
