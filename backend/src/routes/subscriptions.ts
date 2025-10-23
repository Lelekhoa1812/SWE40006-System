import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  RouteGenericInterface,
} from 'fastify';
import { z } from 'zod';
import { ISubscription, Subscription } from '../database/models/Subscription';
import { Doctor } from '../database/models/Doctor';
import { authMiddleware } from './auth';
import type { FlattenMaps } from 'mongoose';

// Zod schemas for validation
const createSubscriptionSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
});

const updateSubscriptionSchema = z.object({
  status: z.enum(['approved', 'denied']),
});

const subscriptionResponseSchema = z.object({
  id: z.string(),
  patient: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
  }),
  doctor: z.object({
    id: z.string(),
    profile: z.object({
      firstName: z.string(),
      lastName: z.string(),
    }),
    specialties: z.array(z.string()),
  }),
  status: z.enum(['requested', 'approved', 'denied', 'cancelled']),
  requestedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

interface GetByIdRoute extends RouteGenericInterface {
  Params: {
    id: string;
  };
}

type PopulatedSubscription = FlattenMaps<ISubscription> & {
  patient: {
    _id: string;
    username: string;
    email: string;
  };
  doctor: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    specialties: string[];
  };
};

type SubscriptionResponse = z.infer<typeof subscriptionResponseSchema>;

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
          patient: userId,
          doctor: body.doctorId,
        });

        if (existingSubscription) {
          return reply.code(400).send({
            error: 'Subscription request already exists',
          });
        }

        // Create subscription request
        const subscription = new Subscription({
          patient: userId,
          doctor: body.doctorId,
          status: 'requested',
          requestedAt: new Date(),
        });

        await subscription.save();

        // Populate the response
        const populatedSubscription = await Subscription.findById(
          subscription._id
        )
          .populate('patient', 'username email')
          .populate('doctor', 'profile.firstName profile.lastName specialties')
          .lean<PopulatedSubscription>();

        const response: SubscriptionResponse = {
          id: populatedSubscription!._id.toString(),
          patient: {
            id: populatedSubscription!.patient._id.toString(),
            username: populatedSubscription!.patient.username,
            email: populatedSubscription!.patient.email,
          },
          doctor: {
            id: populatedSubscription!.doctor._id.toString(),
            profile: {
              firstName: populatedSubscription!.doctor.profile.firstName,
              lastName: populatedSubscription!.doctor.profile.lastName,
            },
            specialties: populatedSubscription!.doctor.specialties,
          },
          status: populatedSubscription!.status,
          requestedAt: populatedSubscription!.requestedAt,
          createdAt: populatedSubscription!.createdAt,
          updatedAt: populatedSubscription!.updatedAt,
        };

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

        reply.code(201).send({
          message: 'Subscription request created successfully',
          subscription: response,
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
          query.patient = userId;
        } else if (userRole === 'doctor') {
          query.doctor = userId;
        } else {
          return reply.code(403).send({
            error: 'Access denied',
          });
        }

        const subscriptions = await Subscription.find(query)
          .populate('patient', 'username email')
          .populate('doctor', 'profile.firstName profile.lastName specialties')
          .sort({ createdAt: -1 })
          .lean<PopulatedSubscription[]>();

        const response: SubscriptionResponse[] = subscriptions.map((sub) => ({
          id: sub._id.toString(),
          patient: {
            id: sub.patient._id.toString(),
            username: sub.patient.username,
            email: sub.patient.email,
          },
          doctor: {
            id: sub.doctor._id.toString(),
            profile: {
              firstName: sub.doctor.profile.firstName,
              lastName: sub.doctor.profile.lastName,
            },
            specialties: sub.doctor.specialties,
          },
          status: sub.status,
          requestedAt: sub.requestedAt,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
        }));

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

        reply.send({ subscriptions: response });
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
    async (request: FastifyRequest<GetByIdRoute>, reply: FastifyReply) => {
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
        };

        if (body.status === 'approved') {
          updateData.approvedAt = new Date();
        } else if (body.status === 'denied') {
          updateData.deniedAt = new Date();
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
        )
          .populate('patient', 'username email')
          .populate('doctor', 'profile.firstName profile.lastName specialties')
          .lean<PopulatedSubscription>();

        const response: SubscriptionResponse = {
          id: updatedSubscription!._id.toString(),
          patient: {
            id: updatedSubscription!.patient._id.toString(),
            username: updatedSubscription!.patient.username,
            email: updatedSubscription!.patient.email,
          },
          doctor: {
            id: updatedSubscription!.doctor._id.toString(),
            profile: {
              firstName: updatedSubscription!.doctor.profile.firstName,
              lastName: updatedSubscription!.doctor.profile.lastName,
            },
            specialties: updatedSubscription!.doctor.specialties,
          },
          status: updatedSubscription!.status,
          requestedAt: updatedSubscription!.requestedAt,
          createdAt: updatedSubscription!.createdAt,
          updatedAt: updatedSubscription!.updatedAt,
        };

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
          subscription: response,
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
}
