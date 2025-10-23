import fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './env';
import { connectDatabase } from './database/connection';
import { Doctor } from './database/models/Doctor';

const server = fastify({
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
server.addHook('onRequest', async (request) => {
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

server.addHook('onResponse', async (request, reply) => {
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
server.register(cors, {
  origin: [
    'http://localhost:3000',
    'https://medmsg-frontend.azurewebsites.net',
  ],
  credentials: true,
});

// Health check route
server.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
});

// API health check route
server.get('/api/v1/health', async (request, reply) => {
  return {
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
});

// Doctors endpoint with real database data
server.get('/api/v1/doctors', async (request, reply) => {
  try {
    const { page = 1, limit = 12, q = '', specialty = '' } = request.query as any;

    // Build query
    const query: any = {};

    if (q) {
      query.$or = [
        { 'profile.firstName': { $regex: q, $options: 'i' } },
        { 'profile.lastName': { $regex: q, $options: 'i' } },
        { specialties: { $regex: q, $options: 'i' } }
      ];
    }

    if (specialty) {
      query.specialties = { $regex: specialty, $options: 'i' };
    }

    // Get total count
    const total = await Doctor.countDocuments(query);

    // Get paginated results
    const doctors = await Doctor.find(query)
      .select('profile specialties rating reviewCount location phone bio consultationFee languages medicalLicense')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    return {
      doctors,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: 'Internal server error' });
  }
});

const start = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    const port = env.PORT;
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`Server listening on port ${port}`);

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
