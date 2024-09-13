import { env } from '@/config/env.config';
import { type Config } from 'drizzle-kit';

export default {
  schema: './src/schemas/*.schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: env.TURSO_DATABASE_URL,
    token: env.TURSO_AUTH_TOKEN,
    authToken: env.TURSO_AUTH_TOKEN
  }
} satisfies Config;
