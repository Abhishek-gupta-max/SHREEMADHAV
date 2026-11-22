import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

// Development gets generous limits so manual testing is not blocked.
const scale = (limit) => (env.isProduction ? limit : limit * 20);

const handler = (_req, res, _next, options) =>
  res.status(options.statusCode).json({
    success: false,
    message: options.message,
    errorCode: 'TOO_MANY_REQUESTS',
  });

const limiter = ({ minutes, limit, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs: minutes * 60 * 1000,
    limit: scale(limit),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests,
    message,
    handler,
  });

export const apiLimiter = limiter({
  minutes: 15,
  limit: 600,
  message: 'Too many requests. Please try again shortly.',
});

export const loginLimiter = limiter({
  minutes: 15,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many sign-in attempts. Please wait 15 minutes and try again.',
});

export const applicationLimiter = limiter({
  minutes: 60,
  limit: 5,
  message: 'Several applications were submitted from your connection recently. Please try again in an hour.',
});

export const contactLimiter = limiter({
  minutes: 60,
  limit: 8,
  message: 'Several messages were sent from your connection recently. Please try again in an hour.',
});

// AI assistant questions (only used when a self-hosted model is configured).
export const assistantLimiter = limiter({
  minutes: 10,
  limit: 40,
  message: 'You have asked a lot of questions in a short time. Please wait a few minutes and try again.',
});
