import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { DoctorDAO, DoctorFilters } from '../database/dao/DoctorDAO';

const DoctorResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.string(),
  profile: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    avatar: z.string().optional(),
  }),
  medicalLicense: z.string(),
  specialties: z.array(z.string()),
  bio: z.string().optional(),
  location: z
    .object({
      address: z.string().optional(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      postalCode: z.string().optional(),
      coordinates: z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .optional(),
    })
    .optional(),
  availability: z
    .object({
      timezone: z.string(),
      schedule: z.array(
        z.object({
          day: z.string(),
          startTime: z.string(),
          endTime: z.string(),
          isAvailable: z.boolean(),
        })
      ),
    })
    .optional(),
  rating: z.number(),
  reviewCount: z.number(),
  consultationFee: z.number().optional(),
  languages: z.array(z.string()),
  isActive: z.boolean(),
  emailVerified: z.boolean(),
  lastLoginAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const DoctorsQuerySchema = z.object({
  q: z.string().optional(),
  specialty: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  minRating: z.string().transform(Number).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

const DoctorsResponseSchema = z.object({
  doctors: z.array(DoctorResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

type DoctorResponse = z.infer<typeof DoctorResponseSchema>;
type DoctorsQuery = z.infer<typeof DoctorsQuerySchema>;
type DoctorsResponse = z.infer<typeof DoctorsResponseSchema>;

export async function doctorRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/doctors',
    async (request: FastifyRequest<{ Querystring: DoctorsQuery }>, reply) => {
      try {
        const query = DoctorsQuerySchema.parse(request.query);
        const { q, specialty, city, state, minRating, page, limit } = query;

        // Use DAO for database operations
        const result = await DoctorDAO.searchDoctors(
          {
            q,
            specialty,
            city,
            state,
            minRating,
            isActive: true,
            emailVerified: true,
          } as DoctorFilters,
          { page, limit }
        );

        const response: DoctorsResponse = {
          doctors: result.doctors as DoctorResponse[],
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
            hasNext: result.page < result.totalPages,
            hasPrev: result.page > 1,
          },
        };

        request.log.info(
          {
            endpoint: '/api/v1/doctors',
            action: 'fetch_doctors',
            filters: { q, specialty, city, state, minRating },
            pagination: {
              page,
              limit,
              total: result.total,
              totalPages: result.totalPages,
            },
          },
          'Fetched doctors with filters and pagination'
        );

        return reply.send(response);
      } catch (error) {
        request.log.error(
          {
            endpoint: '/api/v1/doctors',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Error fetching doctors'
        );

        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: 'Invalid query parameters',
            details: error.errors,
          });
        }

        return reply.code(500).send({
          error: 'Internal server error',
        });
      }
    }
  );

  // Get doctor by ID
  fastify.get(
    '/doctors/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        const { id } = request.params;
        const doctor = await DoctorDAO.getById(id);

        if (!doctor) {
          return reply.code(404).send({ error: 'Doctor not found' });
        }

        request.log.info(
          {
            endpoint: '/api/v1/doctors/:id',
            action: 'fetch_doctor',
            doctorId: id,
          },
          'Fetched doctor by ID'
        );

        return reply.send(doctor);
      } catch (error) {
        request.log.error(
          {
            endpoint: '/api/v1/doctors/:id',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Error fetching doctor by ID'
        );

        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get doctor statistics
  fastify.get('/doctors/stats', async (request, reply) => {
    try {
      const stats = await DoctorDAO.getStatistics();

      request.log.info(
        {
          endpoint: '/api/v1/doctors/stats',
          action: 'fetch_doctor_stats',
        },
        'Fetched doctor statistics'
      );

      return reply.send(stats);
    } catch (error) {
      request.log.error(
        {
          endpoint: '/api/v1/doctors/stats',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Error fetching doctor statistics'
      );

      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
