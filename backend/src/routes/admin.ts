import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AuditLog } from '../database/models/AuditLog';
import { authMiddleware } from './auth';

export async function adminRoutes(fastify: FastifyInstance) {
  const querySchema = z.object({
    limit: z.coerce.number().min(1).max(500).default(100),
    action: z.string().optional(),
  });

  fastify.get(
    '/admin/audit',
    { preHandler: authMiddleware },
    async (
      request: FastifyRequest<{
        Querystring: { limit?: string; action?: string };
      }>,
      reply: FastifyReply
    ) => {
      const user = request.user!;
      if (user.role !== 'admin') {
        return reply.code(403).send({ error: 'Forbidden' });
      }

      const { limit, action } = querySchema.parse(request.query);
      const query: Record<string, unknown> = {};
      if (action) query.action = action;

      const logs = await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      reply.send({ logs });
    }
  );
}
