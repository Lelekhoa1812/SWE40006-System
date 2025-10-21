import { FastifyInstance } from 'fastify';
import { ObjectId } from 'mongodb';
import { getDb } from '../database/client.js';
import { z, ZodError } from 'zod';

const requestBodySchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
});

const updateBodySchema = z.object({
  subscriptionId: z.string().min(1),
});

export async function subscriptionRoutes(fastify: FastifyInstance) {
  fastify.post('/subscriptions/request', async (request, reply) => {
    try {
      const { patientId, doctorId } = requestBodySchema.parse(request.body);

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
        subscriptionId: result.insertedId.toHexString(),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: 'Invalid request body.', issues: error.issues });
      }
      fastify.log.error(error, 'Failed to request subscription');
      reply.code(500).send({ message: 'An error occurred.' });
    }
  });

  fastify.put('/subscriptions/approve', async (request, reply) => {
    try {
      const { subscriptionId } = updateBodySchema.parse(request.body);
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
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: 'Invalid request body.', issues: error.issues });
      }
      fastify.log.error(error, 'Failed to update subscription');
      reply.code(500).send({ message: 'An error occurred.' });
    }
  });

  fastify.put('/subscriptions/deny', async (request, reply) => {
    try {
      const { subscriptionId } = updateBodySchema.parse(request.body);
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
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: 'Invalid request body.', issues: error.issues });
      }
      fastify.log.error(error, 'Failed to update subscription');
      reply.code(500).send({ message: 'An error occurred.' });
    }
  });
}
