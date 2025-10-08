import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import doctorsData from '../../../database/mocks/doctors.json';

const DoctorSchema = z.object({
  id: z.string(),
  name: z.string(),
  specialty: z.string(),
  email: z.string().email(),
  phone: z.string(),
  experience: z.number(),
  rating: z.number(),
  bio: z.string(),
  availability: z.string(),
});

const DoctorsResponseSchema = z.array(DoctorSchema);

type Doctor = z.infer<typeof DoctorSchema>;
type DoctorsResponse = z.infer<typeof DoctorsResponseSchema>;

export async function doctorRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/doctors', async (_request, reply) => {
    const doctors: DoctorsResponse = doctorsData as Doctor[];
    return reply.send(doctors);
  });
}
