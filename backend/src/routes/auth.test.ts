import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { build } from '../index';

describe('Auth Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = build();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new patient successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'testpatient',
          email: 'patient@test.com',
          password: 'password123',
          role: 'patient',
          profile: {
            firstName: 'Test',
            lastName: 'Patient',
            phone: '+1-555-0100',
            dateOfBirth: '1990-01-01',
            gender: 'male',
          },
        },
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.payload);
      expect(data.message).toBe('User created successfully');
      expect(data.user.role).toBe('patient');
    });

    it('should register a new doctor successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'testdoctor',
          email: 'doctor@test.com',
          password: 'password123',
          role: 'doctor',
          profile: {
            firstName: 'Dr. Test',
            lastName: 'Doctor',
            phone: '+1-555-0101',
            dateOfBirth: '1980-01-01',
            gender: 'female',
          },
          medicalLicense: 'MD123456',
          specialties: ['cardiology'],
        },
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.payload);
      expect(data.message).toBe('User created successfully');
      expect(data.user.role).toBe('doctor');
    });

    it('should reject registration with invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123',
          role: 'patient',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject registration with weak password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'testuser',
          email: 'user@test.com',
          password: '123',
          role: 'patient',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'user1',
          email: 'duplicate@test.com',
          password: 'password123',
          role: 'patient',
        },
      });

      // Second registration with same email
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'user2',
          email: 'duplicate@test.com',
          password: 'password123',
          role: 'patient',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Register a test user
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'logintest',
          email: 'login@test.com',
          password: 'password123',
          role: 'patient',
        },
      });
    });

    it('should login with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'login@test.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.message).toBe('Login successful');
      expect(data.user.email).toBe('login@test.com');
    });

    it('should reject login with invalid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'login@test.com',
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject login with non-existent email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'nonexistent@test.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user info with valid headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          'x-test-user-id': '68fa4142885c903d84b6868d',
          'x-test-user-role': 'patient',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.user).toBeDefined();
    });

    it('should return 401 without authentication headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
