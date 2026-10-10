import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { AdminModel } from '../models/admin.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { logActivity } from '../services/activity.service.js';
import { sessionCookieOptions, signSessionToken } from '../services/token.service.js';

export const BCRYPT_ROUNDS = 12;

// Compared against when the email is unknown, so response time does not reveal
// which accounts exist.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-real-password', BCRYPT_ROUNDS);

export async function login(req, res) {
  const { email, password } = req.body;
  const admin = await AdminModel.findByEmail(email);

  const matches = await bcrypt.compare(password, admin?.password_hash || DUMMY_HASH);
  if (!admin || !matches) throw ApiError.unauthorized('The email or password you entered is incorrect.');
  if (!admin.is_active) throw ApiError.forbidden('This account has been deactivated.');

  await AdminModel.touchLogin(admin.id);
  res.cookie(env.jwt.cookieName, signSessionToken(admin), sessionCookieOptions());

  req.admin = AdminModel.toPublic(admin);
  await logActivity(req, { entityType: 'auth', entityId: admin.id, action: 'auth.login' });

  return ok(res, { admin: req.admin }, { message: 'Signed in successfully' });
}

export async function logout(req, res) {
  res.clearCookie(env.jwt.cookieName, sessionCookieOptions({ withMaxAge: false }));
  if (req.admin) await logActivity(req, { entityType: 'auth', entityId: req.admin.id, action: 'auth.logout' });
  return ok(res, null, { message: 'Signed out' });
}

/** Invalidates every session of the current account, on all devices. */
export async function logoutEverywhere(req, res) {
  await AdminModel.incrementTokenVersion(req.admin.id);
  return logout(req, res);
}

export async function me(req, res) {
  return ok(res, { admin: req.admin });
}

/** Like `me`, but answers 200 with `admin: null` when nobody is signed in. */
export async function session(req, res) {
  return ok(res, { admin: req.admin ?? null });
}

export async function updateProfile(req, res) {
  const { name, email } = req.body;
  const existing = await AdminModel.findByEmail(email);
  if (existing && existing.id !== req.admin.id) {
    throw ApiError.validation({ email: 'Another account already uses this email address' });
  }

  await AdminModel.updateProfile(req.admin.id, { name, email });
  await logActivity(req, { entityType: 'admin', entityId: req.admin.id, action: 'admin.profile_updated' });

  const admin = AdminModel.toPublic(await AdminModel.findById(req.admin.id));
  return ok(res, { admin }, { message: 'Profile updated' });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const admin = await AdminModel.findById(req.admin.id);

  if (!(await bcrypt.compare(currentPassword, admin.password_hash))) {
    throw ApiError.validation({ currentPassword: 'Your current password is incorrect' });
  }

  await AdminModel.updatePassword(admin.id, await bcrypt.hash(newPassword, BCRYPT_ROUNDS));
  await logActivity(req, { entityType: 'admin', entityId: admin.id, action: 'admin.password_changed' });

  // The change revoked every session, including this one, so issue a fresh token.
  res.cookie(env.jwt.cookieName, signSessionToken(await AdminModel.findById(admin.id)), sessionCookieOptions());
  return ok(res, null, { message: 'Password updated. Other devices have been signed out.' });
}
