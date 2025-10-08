import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { doctorRoutes } from './doctors';

describe('Doctor Routes', () => {
  it('should return list of doctors', async () => {
    const fastify = Fastify();
    await fastify.register(doctorRoutes, { prefix: '/api/v1' });

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/doctors',
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    // Check first doctor structure
    const firstDoctor = body[0];
    expect(firstDoctor).toHaveProperty('id');
    expect(firstDoctor).toHaveProperty('name');
    expect(firstDoctor).toHaveProperty('specialty');
    expect(firstDoctor).toHaveProperty('email');
    expect(firstDoctor).toHaveProperty('phone');
    expect(firstDoctor).toHaveProperty('experience');
    expect(firstDoctor).toHaveProperty('rating');
    expect(firstDoctor).toHaveProperty('bio');
    expect(firstDoctor).toHaveProperty('availability');

    // Validate types
    expect(typeof firstDoctor.id).toBe('string');
    expect(typeof firstDoctor.name).toBe('string');
    expect(typeof firstDoctor.specialty).toBe('string');
    expect(typeof firstDoctor.email).toBe('string');
    expect(typeof firstDoctor.phone).toBe('string');
    expect(typeof firstDoctor.experience).toBe('number');
    expect(typeof firstDoctor.rating).toBe('number');
    expect(typeof firstDoctor.bio).toBe('string');
    expect(typeof firstDoctor.availability).toBe('string');
  });
});
