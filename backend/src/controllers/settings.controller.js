import { SettingModel } from '../models/setting.model.js';
import { ok } from '../utils/response.js';
import { logActivity } from '../services/activity.service.js';

/** Public: contact details and social links shown in the header, footer and contact page. */
export async function publicSettings(_req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300');
  return ok(res, await SettingModel.getAll());
}

export async function show(_req, res) {
  return ok(res, await SettingModel.getAll());
}

export async function update(req, res) {
  await SettingModel.upsertMany(req.body, req.admin.id);
  await logActivity(req, {
    entityType: 'settings',
    action: 'settings.updated',
    details: { keys: Object.keys(req.body) },
  });
  return ok(res, await SettingModel.getAll(), { message: 'Settings saved' });
}
