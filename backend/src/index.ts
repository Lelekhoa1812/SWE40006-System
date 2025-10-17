import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health';
import { doctorRoutes } from './routes/doctors';
import { subscriptionRoutes } from './routes/subscriptions';
import { messageRoutes } from './routes/messages';
import { env } from './env';

const fastify = Fastify({
  logger: true,
});

// Register CORS
fastify.register(cors, {
  origin: 'http://localhost:3000',
  credentials: true,
});

// Register routes
fastify.register(healthRoutes, { prefix: '' });
fastify.register(doctorRoutes, { prefix: '/api/v1' });
fastify.register(subscriptionRoutes, { prefix: '/api/v1' });
fastify.register(messageRoutes, { prefix: '/api/v1' });

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
