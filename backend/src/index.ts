import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health';
import { doctorRoutes } from './routes/doctors';
import { logger } from './utils/logger';

const fastify = Fastify({
  logger: logger,
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
    const port = Number(process.env.PORT) || 4000;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
