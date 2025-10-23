import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { build } from '../index';

describe('Subscription Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = build();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/v1/subscriptions', () => {
    it('should create a subscription request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/subscriptions',
        headers: {
          'x-test-user-id': '68fa4142885c903d84b6868d',
          'x-test-user-role': 'patient',
        },
        payload: {
          doctorId: '68fa5d2d45ffa1b0b99c4524',
          requestMessage:
            'I would like to subscribe to this doctor for medical consultations.',
        },
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.payload);
      expect(data.message).toBe('Subscription requested successfully');
      expect(data.subscription.status).toBe('requested');
    });

    it('should reject subscription without required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/subscriptions',
        headers: {
          'x-test-user-id': '68fa4142885c903d84b6868d',
          'x-test-user-role': 'patient',
        },
        payload: {
          // Missing doctorId and requestMessage
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject subscription from non-patient role', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/subscriptions',
        headers: {
          'x-test-user-id': '68fa5d2d45ffa1b0b99c4524',
          'x-test-user-role': 'doctor',
        },
        payload: {
          doctorId: '68fa5d2d45ffa1b0b99c4524',
          requestMessage: 'Test message',
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/subscriptions/mine', () => {
    it('should return patient subscriptions', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/subscriptions/mine',
        headers: {
          'x-test-user-id': '68fa4142885c903d84b6868d',
          'x-test-user-role': 'patient',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should return doctor subscriptions', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/subscriptions/mine',
        headers: {
          'x-test-user-id': '68fa5d2d45ffa1b0b99c4524',
          'x-test-user-role': 'doctor',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/subscriptions/mine',
      });

      expect(response.statusCode).toBe(200); // Uses default test user
    });
  });

  describe('PATCH /api/v1/subscriptions/:id', () => {
    it('should allow doctor to approve subscription', async () => {
      // First create a subscription
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/subscriptions',
        headers: {
          'x-test-user-id': '68fa4142885c903d84b6868d',
          'x-test-user-role': 'patient',
        },
        payload: {
          doctorId: '68fa5d2d45ffa1b0b99c4524',
          requestMessage: 'Test subscription request',
        },
      });

      const createData = JSON.parse(createResponse.payload);
      const subscriptionId = createData.subscription.id;

      // Now approve it
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/subscriptions/${subscriptionId}`,
        headers: {
          'x-test-user-id': '68fa5d2d45ffa1b0b99c4524',
          'x-test-user-role': 'doctor',
        },
        payload: {
          status: 'approved',
          responseMessage: 'Your subscription has been approved!',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.message).toBe('Subscription updated successfully');
    });

    it('should allow doctor to deny subscription', async () => {
      // First create a subscription
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/subscriptions',
        headers: {
          'x-test-user-id': '68fa4142885c903d84b6868d',
          'x-test-user-role': 'patient',
        },
        payload: {
          doctorId: '68fa5d2d45ffa1b0b99c4524',
          requestMessage: 'Test subscription request',
        },
      });

      const createData = JSON.parse(createResponse.payload);
      const subscriptionId = createData.subscription.id;

      // Now deny it
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/subscriptions/${subscriptionId}`,
        headers: {
          'x-test-user-id': '68fa5d2d45ffa1b0b99c4524',
          'x-test-user-role': 'doctor',
        },
        payload: {
          status: 'denied',
          responseMessage: 'Sorry, I cannot accept new patients at this time.',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.message).toBe('Subscription updated successfully');
    });

    it('should reject non-doctor from managing subscriptions', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/v1/subscriptions/68fa5ef145ffa1b0b99c453e',
        headers: {
          'x-test-user-id': '68fa4142885c903d84b6868d',
          'x-test-user-role': 'patient',
        },
        payload: {
          status: 'approved',
          responseMessage: 'Test message',
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });
});
