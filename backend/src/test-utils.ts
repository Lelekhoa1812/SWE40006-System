import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';

// Set test environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/medmsg-test';
process.env.SESSION_SECRET =
  'test-session-secret-key-for-testing-only-32-chars';
process.env.LOG_LEVEL = 'silent';
process.env.NODE_ENV = 'test';

export async function build(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false, // Disable logging in tests
  });

  // Register plugins
  await fastify.register(require('@fastify/cors'), {
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  await fastify.register(require('@fastify/session'), {
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    store: require('connect-mongo').create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  });

  // Register routes
  await fastify.register(require('./routes/health'), { prefix: '' });
  await fastify.register(require('./routes/auth'), { prefix: '/api/v1/auth' });
  await fastify.register(require('./routes/doctors'), { prefix: '/api/v1' });
  await fastify.register(require('./routes/subscriptions'), {
    prefix: '/api/v1',
  });
  await fastify.register(require('./routes/messages'), { prefix: '/api/v1' });
  await fastify.register(require('./routes/admin'), {
    prefix: '/api/v1/admin',
  });

  return fastify;
}
