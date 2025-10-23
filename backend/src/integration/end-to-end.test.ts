import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { build } from '../index';

describe('End-to-End Integration Tests', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = build();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Complete Patient-Doctor Flow', () => {
    it('should complete full patient registration to chat flow', async () => {
      // 1. Register a new patient
      const patientResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'e2epatient',
          email: 'e2epatient@test.com',
          password: 'password123',
          role: 'patient',
          profile: {
            firstName: 'E2E',
            lastName: 'Patient',
            phone: '+1-555-0200',
            dateOfBirth: '1990-01-01',
            gender: 'male',
          },
        },
      });

      expect(patientResponse.statusCode).toBe(201);
      const patientData = JSON.parse(patientResponse.payload);
      const patientId = patientData.user.id;

      // 2. Register a new doctor
      const doctorResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'e2edoctor',
          email: 'e2edoctor@test.com',
          password: 'password123',
          role: 'doctor',
          profile: {
            firstName: 'Dr. E2E',
            lastName: 'Doctor',
            phone: '+1-555-0201',
            dateOfBirth: '1980-01-01',
            gender: 'female',
          },
          medicalLicense: 'MD999999',
          specialties: ['general_medicine'],
        },
      });

      expect(doctorResponse.statusCode).toBe(201);
      const doctorData = JSON.parse(doctorResponse.payload);
      const doctorId = doctorData.user.id;

      // 3. Patient creates subscription request
      const subscriptionResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/subscriptions',
        headers: {
          'x-test-user-id': patientId,
          'x-test-user-role': 'patient',
        },
        payload: {
          doctorId: doctorId,
          requestMessage:
            'I would like to consult with you about my health concerns.',
        },
      });

      expect(subscriptionResponse.statusCode).toBe(201);
      const subscriptionData = JSON.parse(subscriptionResponse.payload);
      const subscriptionId = subscriptionData.subscription.id;

      // 4. Doctor approves subscription
      const approvalResponse = await app.inject({
        method: 'PATCH',
        url: `/api/v1/subscriptions/${subscriptionId}`,
        headers: {
          'x-test-user-id': doctorId,
          'x-test-user-role': 'doctor',
        },
        payload: {
          status: 'approved',
          responseMessage:
            'Your subscription has been approved. You can now start messaging with me.',
        },
      });

      expect(approvalResponse.statusCode).toBe(200);

      // 5. Patient sends a message
      const patientMessageResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/chat/messages',
        headers: {
          'x-test-user-id': patientId,
          'x-test-user-role': 'patient',
        },
        payload: {
          subscriptionId: subscriptionId,
          content:
            'Hello doctor, I have been experiencing some symptoms lately.',
          messageType: 'text',
        },
      });

      expect(patientMessageResponse.statusCode).toBe(200);
      const patientMessageData = JSON.parse(patientMessageResponse.payload);
      expect(patientMessageData.data.senderRole).toBe('patient');

      // 6. Doctor responds to message
      const doctorMessageResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/chat/messages',
        headers: {
          'x-test-user-id': doctorId,
          'x-test-user-role': 'doctor',
        },
        payload: {
          subscriptionId: subscriptionId,
          content:
            'Hello! I received your message. Can you tell me more about your symptoms?',
          messageType: 'text',
        },
      });

      expect(doctorMessageResponse.statusCode).toBe(200);
      const doctorMessageData = JSON.parse(doctorMessageResponse.payload);
      expect(doctorMessageData.data.senderRole).toBe('doctor');

      // 7. Retrieve chat history
      const chatHistoryResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/chat/messages/${subscriptionId}`,
        headers: {
          'x-test-user-id': patientId,
          'x-test-user-role': 'patient',
        },
      });

      expect(chatHistoryResponse.statusCode).toBe(200);
      const chatHistory = JSON.parse(chatHistoryResponse.payload);
      expect(chatHistory).toHaveLength(2);
      expect(chatHistory[0].senderRole).toBe('patient');
      expect(chatHistory[1].senderRole).toBe('doctor');
    });

    it('should handle subscription denial flow', async () => {
      // 1. Register patient and doctor (reuse from previous test setup)
      const patientResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'denypatient',
          email: 'denypatient@test.com',
          password: 'password123',
          role: 'patient',
        },
      });

      const doctorResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'denydoctor',
          email: 'denydoctor@test.com',
          password: 'password123',
          role: 'doctor',
          medicalLicense: 'MD888888',
          specialties: ['general_medicine'],
        },
      });

      const patientId = JSON.parse(patientResponse.payload).user.id;
      const doctorId = JSON.parse(doctorResponse.payload).user.id;

      // 2. Patient creates subscription request
      const subscriptionResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/subscriptions',
        headers: {
          'x-test-user-id': patientId,
          'x-test-user-role': 'patient',
        },
        payload: {
          doctorId: doctorId,
          requestMessage: 'I would like to consult with you.',
        },
      });

      const subscriptionId = JSON.parse(subscriptionResponse.payload)
        .subscription.id;

      // 3. Doctor denies subscription
      const denialResponse = await app.inject({
        method: 'PATCH',
        url: `/api/v1/subscriptions/${subscriptionId}`,
        headers: {
          'x-test-user-id': doctorId,
          'x-test-user-role': 'doctor',
        },
        payload: {
          status: 'denied',
          responseMessage: 'I am not accepting new patients at this time.',
        },
      });

      expect(denialResponse.statusCode).toBe(200);

      // 4. Patient should not be able to send messages
      const messageResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/chat/messages',
        headers: {
          'x-test-user-id': patientId,
          'x-test-user-role': 'patient',
        },
        payload: {
          subscriptionId: subscriptionId,
          content: 'This should fail',
          messageType: 'text',
        },
      });

      expect(messageResponse.statusCode).toBe(403);
    });
  });

  describe('Authentication Flow', () => {
    it('should handle login and logout flow', async () => {
      // 1. Register a user
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'authuser',
          email: 'authuser@test.com',
          password: 'password123',
          role: 'patient',
        },
      });

      // 2. Login with correct credentials
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'authuser@test.com',
          password: 'password123',
        },
      });

      expect(loginResponse.statusCode).toBe(200);
      const loginData = JSON.parse(loginResponse.payload);
      expect(loginData.message).toBe('Login successful');

      // 3. Login with incorrect credentials
      const failedLoginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'authuser@test.com',
          password: 'wrongpassword',
        },
      });

      expect(failedLoginResponse.statusCode).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid endpoints gracefully', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/invalid-endpoint',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: 'invalid json',
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
