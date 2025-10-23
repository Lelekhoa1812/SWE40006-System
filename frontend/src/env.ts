import { z } from 'zod';

const isDev = process.env.NODE_ENV === 'development';

const EnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url()
    .describe('Base URL for the backend API')
    .default(
      isDev ? 'http://localhost:4000' : 'https://medmsg-blue.azurewebsites.net'
    ),
});

export type FrontendEnv = z.infer<typeof EnvSchema>;

export const env: FrontendEnv = EnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (isDev ? 'http://localhost:4000' : 'https://medmsg-blue.azurewebsites.net'),
});
