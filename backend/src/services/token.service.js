import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const ISSUER = 'shreemadhav-api';
const AUDIENCE = 'shreemadhav-admin';

export function signSessionToken(admin) {
  return jwt.sign({ ver: admin.token_version }, env.jwt.secret, {
    subject: String(admin.id),
    expiresIn: env.jwt.expiresIn,
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithm: 'HS256',
  });
}

/** Returns { sub, ver } for a valid token, otherwise null. */
export function verifySessionToken(token) {
  try {
    const payload = jwt.verify(token, env.jwt.secret, {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ['HS256'],
    });
    return { sub: Number(payload.sub), ver: Number(payload.ver) };
  } catch {
    return null;
  }
}

const UNIT_MS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

/** Converts JWT-style durations ("8h", "30m", "2d", "3600") to milliseconds. */
export function durationToMs(value) {
  const match = /^(\d+)\s*([smhd])?$/.exec(String(value).trim());
  if (!match) throw new Error(`Unsupported duration: ${value}`);
  return Number(match[1]) * UNIT_MS[match[2] || 's'];
}

/** HTTP-only, SameSite=Strict cookie scoped to the API. */
export function sessionCookieOptions({ withMaxAge = true } = {}) {
  const options = {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    path: '/api',
  };
  if (withMaxAge) options.maxAge = durationToMs(env.jwt.expiresIn);
  return options;
}
