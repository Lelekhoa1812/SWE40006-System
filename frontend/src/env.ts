import { z } from 'zod';

// Provide default value for build time
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://medmsg-blue.azurewebsites.net';

const EnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url()
    .describe('Base URL for the backend API'),
});

export type FrontendEnv = z.infer<typeof EnvSchema>;

export const env: FrontendEnv = EnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: apiBaseUrl,
});
