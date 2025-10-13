import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z
    .string()
    .regex(/^\d+$/)
    .transform((v) => Number(v))
    .default('4000'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  MONGODB_URI: z.string().url().optional(),
});

export type BackendEnv = z.infer<typeof EnvSchema> & { PORT: number };

export const env: BackendEnv = EnvSchema.transform((v) => ({
  ...v,
  PORT: typeof v.PORT === 'string' ? Number(v.PORT) : v.PORT,
})).parse({
  PORT: process.env.PORT ?? '4000',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  MONGODB_URI: process.env.MONGODB_URI,
});
