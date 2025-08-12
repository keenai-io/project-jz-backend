import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
  
  // Firebase Admin Configuration
  FIREBASE_PROJECT_ID: z.string().min(1).optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),
  FIRESTORE_DATABASE_ID: z.string().min(1).optional(), // Optional: specify database ID
  
  // Optional: Path to service account credentials file
  GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1).optional(),
}).refine(
  (data) => {
    // Either use individual Firebase env vars OR credentials file path
    const hasFirebaseEnvVars = data.FIREBASE_PROJECT_ID && data.FIREBASE_CLIENT_EMAIL && data.FIREBASE_PRIVATE_KEY;
    const hasCredentialsPath = data.GOOGLE_APPLICATION_CREDENTIALS;
    
    return hasFirebaseEnvVars || hasCredentialsPath;
  },
  {
    message: "Either provide FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY or GOOGLE_APPLICATION_CREDENTIALS",
  }
);

export const env = envSchema.parse(process.env);