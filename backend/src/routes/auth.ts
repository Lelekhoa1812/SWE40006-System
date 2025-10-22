import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { User } from '../database/models/User';
import { writeAudit } from '../middleware/audit';

// Zod schemas for validation
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['patient', 'doctor', 'admin']).default('patient'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
});

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
  }
}

// Auth middleware
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const session = request.session as { userId?: string };

  if (!session || !session.userId) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }

  try {
    const user = await User.findById(session.userId).select('-password');
    if (!user) {
      reply.code(401).send({ error: 'User not found' });
      return;
    }

    request.user = {
      id: (user._id as any).toString(),
      username: (user as any).username,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function authRoutes(fastify: FastifyInstance) {
  // Register route
  fastify.post(
    '/register',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = registerSchema.parse(request.body);

        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [{ email: body.email }, { username: body.username }],
        });

        if (existingUser) {
          reply.code(400).send({ error: 'User already exists' });
          return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(body.password, 12);

        // Create user
        const user = new User({
          username: body.username,
          email: body.email,
          password: hashedPassword,
          role: body.role,
        });

        await user.save();

        // Set session
        (request.session as any).userId = (user._id as any).toString();

        await writeAudit({
          request,
          action: 'user.register',
          resourceType: 'user',
          resourceId: (user._id as any).toString(),
        });

        reply.code(201).send({
          message: 'User registered successfully',
          user: {
            id: (user._id as any).toString(),
            username: (user as any).username,
            email: user.email,
            role: user.role,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          reply
            .code(400)
            .send({ error: 'Validation error', details: error.errors });
          return;
        }
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Login route
  fastify.post(
    '/login',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = loginSchema.parse(request.body);

        // Find user by email
        const user = await User.findOne({ email: body.email });
        if (!user) {
          reply.code(401).send({ error: 'Invalid credentials' });
          return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          body.password,
          user.password!
        );
        if (!isValidPassword) {
          reply.code(401).send({ error: 'Invalid credentials' });
          return;
        }

        // Set session
        (request.session as any).userId = (user._id as any).toString();

        await writeAudit({
          request,
          action: 'user.login',
          resourceType: 'user',
          resourceId: (user._id as any).toString(),
        });

        reply.send({
          message: 'Login successful',
          user: {
            id: (user._id as any).toString(),
            username: (user as any).username,
            email: user.email,
            role: user.role,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          reply
            .code(400)
            .send({ error: 'Validation error', details: error.errors });
          return;
        }
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Logout route
  fastify.post(
    '/logout',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        request.session.destroy((err) => {
          if (err) {
            reply.code(500).send({ error: 'Could not log out' });
            return;
          }
          void writeAudit({ request, action: 'user.logout' });
          reply.send({ message: 'Logout successful' });
        });
      } catch (error) {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get current user route
  fastify.get(
    '/me',
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      reply.send({
        user: request.user,
      });
    }
  );

  // Update profile route
  fastify.patch(
    '/profile',
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = updateProfileSchema.parse(request.body);
        const userId = request.user!.id;

        const updateData: any = {};
        if (body.username) updateData.username = body.username;
        if (body.email) updateData.email = body.email;

        const user = await User.findByIdAndUpdate(userId, updateData, {
          new: true,
          select: '-password',
        });

        if (!user) {
          reply.code(404).send({ error: 'User not found' });
          return;
        }

        reply.send({
          message: 'Profile updated successfully',
          user: {
            id: (user._id as any).toString(),
            username: (user as any).username,
            email: user.email,
            role: user.role,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          reply
            .code(400)
            .send({ error: 'Validation error', details: error.errors });
          return;
        }
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );
}
