import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default(''),
  JWT_SECRET: z.string().min(1).default('dev-only-change-me-to-a-long-random-string'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SEED_ON_START: z.string().default('true'),
  DEMO_USER_EMAIL: z.string().email().default('demo@apparcacuc.com'),
  DEMO_USER_PASSWORD: z.string().default('Demo123!'),
  DEMO_ADMIN_EMAIL: z.string().email().default('admin@apparcacuc.com'),
  DEMO_ADMIN_PASSWORD: z.string().default('Admin123!'),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  ...raw,
  isProd: raw.NODE_ENV === 'production',
  isDev: raw.NODE_ENV === 'development',
  seedOnStart: raw.SEED_ON_START.toLowerCase() === 'true',
  clientOrigins: raw.CLIENT_URL.split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean),
};

// Production safety: refuse to boot with a weak/placeholder JWT secret.
if (env.isProd && (env.JWT_SECRET.length < 32 || env.JWT_SECRET.includes('change-me'))) {
  // eslint-disable-next-line no-console
  console.error('❌ JWT_SECRET must be a strong secret (>= 32 chars) in production.');
  process.exit(1);
}
