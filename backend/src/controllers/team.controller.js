import bcrypt from 'bcryptjs';
import { AdminModel } from '../models/admin.model.js';
import { ApiError } from '../utils/ApiError.js';
import { created, ok } from '../utils/response.js';
import { logActivity } from '../services/activity.service.js';
import { BCRYPT_ROUNDS } from './auth.controller.js';

// Team management (Admin → Settings → Team). Super administrators only.

export async function list(_req, res) {
  return ok(res, await AdminModel.list());
}

export async function create(req, res) {
  const { name, email, password, role } = req.body;
  if (await AdminModel.findByEmail(email)) {
    throw ApiError.validation({ email: 'An account with this email already exists' });
  }

  const id = await AdminModel.create({ name, email, role, passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) });
  await logActivity(req, { entityType: 'admin', entityId: id, action: 'admin.created', details: { email, role } });

  return created(res, AdminModel.toPublic(await AdminModel.findById(id)), { message: 'Team member added' });
}

export async function update(req, res) {
  const { id } = req.params;
  const { role, isActive } = req.body;
  const target = await AdminModel.findById(id);
  if (!target) throw ApiError.notFound('Team member not found.');

  if (target.id === req.admin.id && (!isActive || role !== target.role)) {
    throw ApiError.badRequest('You cannot change your own role or deactivate your own account.');
  }

  const removingSuperAdmin = target.role === 'super_admin' && (role !== 'super_admin' || !isActive);
  if (removingSuperAdmin && (await AdminModel.countActiveSuperAdmins()) <= 1) {
    throw ApiError.badRequest('At least one active super administrator is required.');
  }

  await AdminModel.updateAccess(id, { role, isActive });
  await logActivity(req, { entityType: 'admin', entityId: id, action: 'admin.access_updated', details: { role, isActive } });

  return ok(res, AdminModel.toPublic(await AdminModel.findById(id)), { message: 'Team member updated' });
}
