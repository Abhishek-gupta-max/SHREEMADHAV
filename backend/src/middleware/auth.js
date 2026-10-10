import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { verifySessionToken } from '../services/token.service.js';
import { AdminModel } from '../models/admin.model.js';

async function resolveAdmin(req) {
  const token = req.cookies?.[env.jwt.cookieName];
  if (!token) throw ApiError.unauthorized();

  const payload = verifySessionToken(token);
  if (!payload) throw ApiError.unauthorized('Your session has expired. Please sign in again.');

  // Token version must match, so password changes and deactivation revoke sessions.
  const admin = await AdminModel.findById(payload.sub);
  if (!admin || !admin.is_active || admin.token_version !== payload.ver) {
    throw ApiError.unauthorized('Your session is no longer valid. Please sign in again.');
  }
  return AdminModel.toPublic(admin);
}

/** Requires a signed-in administrator; sets req.admin. */
export async function requireAuth(req, _res, next) {
  req.admin = await resolveAdmin(req);
  next();
}

/** Sets req.admin when a valid session exists, without requiring one. */
export async function optionalAuth(req, _res, next) {
  try {
    req.admin = await resolveAdmin(req);
  } catch {
    req.admin = undefined;
  }
  next();
}

/** Restricts a route to the listed roles. Must run after requireAuth. */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) throw ApiError.forbidden();
    next();
  };
}

/** Roles allowed to change data; viewers are read-only. */
export const canEdit = requireRole('super_admin', 'admin');
export const superAdminOnly = requireRole('super_admin');
