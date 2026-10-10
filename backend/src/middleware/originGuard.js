import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Cross-site request forgery defence for cookie-authenticated requests:
 * browsers always send Origin on state-changing requests, and it must be this
 * site or an allowed origin. (The session cookie is also SameSite=Strict.)
 */
export function originGuard(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  if (!origin) return next(); // non-browser clients such as curl or server-to-server calls

  const selfOrigin = `${req.protocol}://${req.get('host')}`;
  if (origin === selfOrigin || env.corsOrigins.includes(origin)) return next();

  throw ApiError.forbidden('Request origin is not allowed.');
}
