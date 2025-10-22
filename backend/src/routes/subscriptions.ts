import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Subscription } from '../database/models/Subscription';
import { Doctor } from '../database/models/Doctor';
import { User } from '../database/models/User';
import { authMiddleware } from './auth';
import { writeAudit } from '../middleware/audit';

// Zod schemas for validation
const createSubscriptionSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
});

const updateSubscriptionSchema = z.object({
  status: z.enum(['approved', 'denied']),
});

export async function subscriptionRoutes(fastify: FastifyInstance) {
  // Create subscription request (patient only)
  fastify.post(
    '/subscriptions',
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = createSubscriptionSchema.parse(request.body);
        const userId = request.user!.id;
        const userRole = request.user!.role;

        // Only patients can request subscriptions
        if (userRole !== 'patient') {
          return reply.code(403).send({
            error: 'Only patients can request subscriptions',
          });
        }

        // Check if doctor exists
        const doctor = await Doctor.findById(body.doctorId);
        if (!doctor) {
          return reply.code(404).send({ error: 'Doctor not found' });
        }

        // Check if subscription already exists
        const existingSubscription = await Subscription.findOne({
          patientId: userId,
          doctorId: body.doctorId,
        });

        if (existingSubscription) {
          return reply.code(400).send({
            error: 'Subscription request already exists',
          });
        }

        // Create subscription request
        const subscription = new Subscription({
          patientId: userId,
          doctorId: body.doctorId,
          status: 'requested',
          requestedAt: new Date(),
        });

        await subscription.save();

        request.log.info(
          {
            endpoint: '/api/v1/subscriptions',
            action: 'create_subscription',
            patientId: userId,
            doctorId: body.doctorId,
            subscriptionId: subscription._id.toString(),
          },
          'Subscription request created'
        );

        await writeAudit({
          request,
          action: 'subscription.request',
          resourceType: 'subscription',
          resourceId: subscription._id.toString(),
          metadata: { doctorId: body.doctorId },
        });

        reply.code(201).send({
          message: 'Subscription request created successfully',
          subscription: {
            id: subscription._id.toString(),
            status: subscription.status,
            requestedAt: subscription.requestedAt,
            doctorId: body.doctorId,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: 'Validation error',
            details: error.errors,
          });
        }

        request.log.error(
          {
            endpoint: '/api/v1/subscriptions',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Error creating subscription'
        );

        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Compatibility alias for tests: POST /subscriptions/request
  fastify.post(
    '/subscriptions/request',
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = z
          .object({
            doctorId: z.string().min(1),
          })
          .parse(request.body);

        const userId = request.user!.id;

        const existing = await Subscription.findOne({
          patientId: userId,
          doctorId: body.doctorId,
        });
        if (existing) {
          return reply.code(400).send({ error: 'Subscription exists' });
        }

        const sub = await Subscription.create({
          patientId: userId,
          doctorId: body.doctorId,
          status: 'requested',
          requestedAt: new Date(),
        });

        await writeAudit({
          request,
          action: 'subscription.request',
          resourceType: 'subscription',
          resourceId: sub._id.toString(),
          metadata: { doctorId: body.doctorId },
        });

        return reply
          .code(201)
          .send({
            message: 'Subscription requested successfully.',
            id: sub._id.toString(),
          });
      } catch (err) {
        if (err instanceof z.ZodError) {
          return reply
            .code(400)
            .send({ error: 'Bad request', details: err.errors });
        }
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get user's subscriptions (both patients and doctors)
  fastify.get(
    '/subscriptions/mine',
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user!.id;
        const userRole = request.user!.role;

        let query: Record<string, any> = {};
        if (userRole === 'patient') {
          query.patientId = userId;
        } else if (userRole === 'doctor') {
          query.doctorId = userId;
        } else {
          return reply.code(403).send({
            error: 'Access denied',
          });
        }

        const subscriptions = await Subscription.find(query)
          .sort({ createdAt: -1 })
          .lean();

        // Get additional details for each subscription
        const subscriptionsWithDetails = await Promise.all(
          subscriptions.map(async (sub) => {
            let patientDetails = null;
            let doctorDetails = null;

            if (userRole === 'patient') {
              // For patients, get doctor details
              doctorDetails = await Doctor.findById(sub.doctorId)
                .select('profile.firstName profile.lastName specialties')
                .lean();
            } else {
              // For doctors, get patient details
              patientDetails = await User.findById(sub.patientId)
                .select('username email')
                .lean();
            }

            return {
              id: sub._id.toString(),
              patient: patientDetails
                ? {
                    id: patientDetails._id.toString(),
                    username: patientDetails.username,
                    email: patientDetails.email,
                  }
                : null,
              doctor: doctorDetails
                ? {
                    id: doctorDetails._id.toString(),
                    profile: {
                      firstName: doctorDetails.profile.firstName,
                      lastName: doctorDetails.profile.lastName,
                    },
                    specialties: doctorDetails.specialties,
                  }
                : null,
              status: sub.status,
              requestedAt: sub.requestedAt,
              respondedAt: sub.respondedAt,
              createdAt: sub.createdAt,
              updatedAt: sub.updatedAt,
            };
          })
        );

        request.log.info(
          {
            endpoint: '/api/v1/subscriptions/mine',
            action: 'fetch_subscriptions',
            userId,
            userRole,
            count: subscriptions.length,
          },
          'Fetched user subscriptions'
        );

        reply.send({ subscriptions: subscriptionsWithDetails });
      } catch (error) {
        request.log.error(
          {
            endpoint: '/api/v1/subscriptions/mine',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Error fetching subscriptions'
        );

        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Update subscription status (doctor only)
  fastify.patch(
    '/subscriptions/:id',
    { preHandler: authMiddleware },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const body = updateSubscriptionSchema.parse(request.body);
        const userId = request.user!.id;
        const userRole = request.user!.role;

        // Only doctors can approve/deny subscriptions
        if (userRole !== 'doctor') {
          return reply.code(403).send({
            error: 'Only doctors can approve or deny subscriptions',
          });
        }

        const subscription = await Subscription.findById(id);
        if (!subscription) {
          return reply.code(404).send({ error: 'Subscription not found' });
        }

        // Check if the doctor owns this subscription
        if (subscription.doctorId !== userId) {
          return reply.code(403).send({
            error: 'You can only manage your own subscriptions',
          });
        }

        // Update subscription status
        const updateData: Record<string, any> = {
          status: body.status,
          respondedAt: new Date(),
        };

        const updatedSubscription = await Subscription.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
        ).lean();

        request.log.info(
          {
            endpoint: '/api/v1/subscriptions/:id',
            action: 'update_subscription',
            subscriptionId: id,
            doctorId: userId,
            newStatus: body.status,
          },
          'Subscription status updated'
        );

        reply.send({
          message: `Subscription ${body.status} successfully`,
          subscription: {
            id: updatedSubscription!._id.toString(),
            status: updatedSubscription!.status,
            requestedAt: updatedSubscription!.requestedAt,
            respondedAt: updatedSubscription!.respondedAt,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: 'Validation error',
            details: error.errors,
          });
        }

        request.log.error(
          {
            endpoint: '/api/v1/subscriptions/:id',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Error updating subscription'
        );

        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Compatibility aliases for tests: PUT approve/deny
  fastify.put(
    '/subscriptions/approve',
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = z
        .object({ subscriptionId: z.string().min(1) })
        .parse(request.body);
      const result = await Subscription.updateOne(
        { _id: body.subscriptionId },
        { $set: { status: 'approved', respondedAt: new Date() } }
      );
      if (result.matchedCount === 0) {
        return reply.code(404).send({ message: 'Subscription not found.' });
      }
      await writeAudit({
        request,
        action: 'subscription.approve',
        resourceType: 'subscription',
        resourceId: body.subscriptionId,
      });
      return reply
        .code(200)
        .send({ message: 'Subscription status updated to approved.' });
    }
  );

  fastify.put(
    '/subscriptions/deny',
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = z
        .object({ subscriptionId: z.string().min(1) })
        .parse(request.body);
      const result = await Subscription.updateOne(
        { _id: body.subscriptionId },
        { $set: { status: 'denied', respondedAt: new Date() } }
      );
      if (result.matchedCount === 0) {
        return reply.code(404).send({ message: 'Subscription not found.' });
      }
      await writeAudit({
        request,
        action: 'subscription.deny',
        resourceType: 'subscription',
        resourceId: body.subscriptionId,
      });
      return reply
        .code(200)
        .send({ message: 'Subscription status updated to denied.' });
    }
  );
}
