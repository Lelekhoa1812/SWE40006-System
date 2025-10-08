import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  uptime: z.number(),
});

type HealthResponse = z.infer<typeof HealthResponseSchema>;

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async (_request, reply) => {
    const response: HealthResponse = {
      status: 'ok',
      uptime: process.uptime(),
    };

    return reply.send(response);
  });
}
