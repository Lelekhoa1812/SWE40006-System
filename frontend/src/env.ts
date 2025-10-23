import { z } from 'zod';

// Hardcode the API URL for now to ensure it's properly embedded
const apiBaseUrl = 'https://medmsg-railway-production.up.railway.app';

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
