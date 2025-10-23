import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { build } from '../index';

describe('Chat Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = build();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/v1/chat/messages', () => {
    it('should create a message from patient', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/chat/messages',
        headers: {
          'x-test-user-id': '68fa4142885c903d84b6868d',
          'x-test-user-role': 'patient',
        },
        payload: {
          subscriptionId: '68fa5ef145ffa1b0b99c453e',
          content: 'Hello doctor, I have a question about my health.',
          messageType: 'text',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.message).toBe('Message sent successfully');
      expect(data.data.senderRole).toBe('patient');
      expect(data.data.content).toBe(
        'Hello doctor, I have a question about my health.'
      );
    });

    it('should create a message from doctor', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/chat/messages',
        headers: {
          'x-test-user-id': '68fa5d2d45ffa1b0b99c4524',
          'x-test-user-role': 'doctor',
        },
        payload: {
          subscriptionId: '68fa5ef145ffa1b0b99c453e',
          content:
            'Hello patient, I received your message. How can I help you?',
          messageType: 'text',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.message).toBe('Message sent successfully');
      expect(data.data.senderRole).toBe('doctor');
      expect(data.data.content).toBe(
        'Hello patient, I received your message. How can I help you?'
      );
    });

    it('should reject message without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/chat/messages',
        payload: {
          subscriptionId: '68fa5ef145ffa1b0b99c453e',
          content: 'Test message',
          messageType: 'text',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject message with invalid subscription', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/chat/messages',
        headers: {
          'x-test-user-id': '68fa4142885c903d84b6868d',
          'x-test-user-role': 'patient',
        },
        payload: {
          subscriptionId: 'invalid-subscription-id',
          content: 'Test message',
          messageType: 'text',
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should reject message without required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/chat/messages',
        headers: {
          'x-test-user-id': '68fa4142885c903d84b6868d',
          'x-test-user-role': 'patient',
        },
        payload: {
          // Missing subscriptionId and content
          messageType: 'text',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/chat/messages/:subscriptionId', () => {
    it('should retrieve messages for patient', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/chat/messages/68fa5ef145ffa1b0b99c453e',
        headers: {
          'x-test-user-id': '68fa4142885c903d84b6868d',
          'x-test-user-role': 'patient',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should retrieve messages for doctor', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/chat/messages/68fa5ef145ffa1b0b99c453e',
        headers: {
          'x-test-user-id': '68fa5d2d45ffa1b0b99c4524',
          'x-test-user-role': 'doctor',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should reject access for unauthorized user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/chat/messages/68fa5ef145ffa1b0b99c453e',
        headers: {
          'x-test-user-id': 'unauthorized-user-id',
          'x-test-user-role': 'patient',
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/chat/messages/68fa5ef145ffa1b0b99c453e',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Message Role Assignment', () => {
    it('should assign correct senderRole for patient messages', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/chat/messages',
        headers: {
          'x-test-user-id': '68fa4142885c903d84b6868d',
          'x-test-user-role': 'patient',
        },
        payload: {
          subscriptionId: '68fa5ef145ffa1b0b99c453e',
          content: 'Patient message',
          messageType: 'text',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.data.senderRole).toBe('patient');
    });

    it('should assign correct senderRole for doctor messages', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/chat/messages',
        headers: {
          'x-test-user-id': '68fa5d2d45ffa1b0b99c4524',
          'x-test-user-role': 'doctor',
        },
        payload: {
          subscriptionId: '68fa5ef145ffa1b0b99c453e',
          content: 'Doctor message',
          messageType: 'text',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.data.senderRole).toBe('doctor');
    });
  });
});
