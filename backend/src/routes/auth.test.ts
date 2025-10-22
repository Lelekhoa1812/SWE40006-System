import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { authRoutes } from './auth';
import { User } from '../database/models/User';

describe('Auth Routes', () => {
  let fastify: FastifyInstance;

  beforeEach(async () => {
    fastify = Fastify();

    // Mock session plugin
    fastify.register(require('@fastify/session'), {
      secret: 'test-secret',
      cookie: { secure: false },
    });

    fastify.register(authRoutes, { prefix: '/api/v1/auth' });

    await fastify.ready();
  });

  afterEach(async () => {
    await fastify.close();
    await User.deleteMany({});
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'patient',
        },
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.payload);
      expect(data.message).toBe('User registered successfully');
      expect(data.user.username).toBe('testuser');
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.role).toBe('patient');
    });

    it('should reject duplicate email', async () => {
      await User.create({
        username: 'existing',
        email: 'test@example.com',
        password: 'hashed',
        role: 'patient',
      });

      const response = await fastify.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'newuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'patient',
        },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.payload);
      expect(data.error).toBe('User already exists');
    });

    it('should validate input', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'ab', // too short
          email: 'invalid-email',
          password: '123', // too short
        },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.payload);
      expect(data.error).toBe('Validation error');
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      const hashedPassword = await require('bcryptjs').hash('password123', 12);
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'patient',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.message).toBe('Login successful');
      expect(data.user.username).toBe('testuser');
    });

    it('should reject invalid credentials', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);
      const data = JSON.parse(response.payload);
      expect(data.error).toBe('Invalid credentials');
    });
  });
});
