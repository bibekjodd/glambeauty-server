import { type Config } from 'drizzle-kit';
import { env } from './src/config/env.config';

export default {
  schema: './src/schemas/*schema.ts',
  dialect: 'turso',
  casing: 'snake_case',
  dbCredentials: {
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN
  }
} satisfies Config;
