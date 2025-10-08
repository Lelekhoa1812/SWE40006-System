import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { healthRoutes } from './health';

describe('Health Routes', () => {
  it('should return health status and uptime', async () => {
    const fastify = Fastify();
    await fastify.register(healthRoutes);

    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('uptime');
    expect(typeof body.uptime).toBe('number');
    expect(body.uptime).toBeGreaterThanOrEqual(0);
  });
});
