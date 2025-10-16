import { FastifyInstance, FastifyRequest } from 'fastify';
import { ObjectId } from 'mongodb';
import { getDb } from '../database/client';
import { z } from 'zod';

const requestBodySchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
});

const updateBodySchema = z.object({
  subscriptionId: z.string().min(1),
});

export async function subscriptionRoutes(fastify: FastifyInstance) {
  // Endpoint to request a new subscription
  fastify.post(
    '/subscriptions/request',
    async (
      request: FastifyRequest<{ Body: z.infer<typeof requestBodySchema> }>,
      reply
    ) => {
      const { patientId, doctorId } = request.body;
      const db = await getDb();
      const subscriptions = db.collection('subscriptions');

      const result = await subscriptions.insertOne({
        patient_id: new ObjectId(patientId),
        doctor_id: new ObjectId(doctorId),
        status: 'requested',
        created_at: new Date(),
      });

      reply.code(201).send({
        message: 'Subscription requested successfully.',
        subscriptionId: result.insertedId,
      });
    }
  );

  // Endpoint to approve a subscription
  fastify.put(
    '/subscriptions/approve',
    async (
      request: FastifyRequest<{ Body: z.infer<typeof updateBodySchema> }>,
      reply
    ) => {
      const { subscriptionId } = request.body;
      const db = await getDb();
      const subscriptions = db.collection('subscriptions');

      const result = await subscriptions.updateOne(
        { _id: new ObjectId(subscriptionId) },
        { $set: { status: 'approved' } }
      );

      if (result.matchedCount === 0) {
        return reply.code(404).send({ message: 'Subscription not found.' });
      }

      reply
        .code(200)
        .send({ message: 'Subscription status updated to approved.' });
    }
  );

  // Endpoint to deny a subscription
  fastify.put(
    '/subscriptions/deny',
    async (
      request: FastifyRequest<{ Body: z.infer<typeof updateBodySchema> }>,
      reply
    ) => {
      const { subscriptionId } = request.body;
      const db = await getDb();
      const subscriptions = db.collection('subscriptions');

      const result = await subscriptions.updateOne(
        { _id: new ObjectId(subscriptionId) },
        { $set: { status: 'denied' } }
      );

      if (result.matchedCount === 0) {
        return reply.code(404).send({ message: 'Subscription not found.' });
      }

      reply
        .code(200)
        .send({ message: 'Subscription status updated to denied.' });
    }
  );
}
