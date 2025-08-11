import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  AUTH_SECRET: z.string().min(1),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env);