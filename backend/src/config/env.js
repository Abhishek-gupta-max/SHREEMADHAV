import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(rootDir, '.env'), quiet: true });

const required = (name) => {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const int = (name, fallback) => {
  const parsed = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = required('JWT_SECRET');

if (isProduction && (jwtSecret.length < 32 || jwtSecret.startsWith('replace-with'))) {
  throw new Error('JWT_SECRET must be a random string of at least 32 characters in production');
}

export const env = Object.freeze({
  rootDir,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: int('PORT', 5000),
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  trustProxy: process.env.TRUST_PROXY === 'true',
  serveFrontend: process.env.SERVE_FRONTEND === 'true',

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: int('DB_PORT', 3306),
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD || '',
    database: required('DB_NAME'),
    connectionLimit: int('DB_CONNECTION_LIMIT', 10),
  },

  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    cookieName: process.env.COOKIE_NAME || 'smos_session',
  },

  uploads: {
    dir: path.resolve(rootDir, process.env.UPLOAD_DIR || 'uploads'),
    maxFileSize: int('MAX_FILE_SIZE_MB', 5) * 1024 * 1024,
    maxSupportingFiles: int('MAX_SUPPORTING_FILES', 4),
  },
});
