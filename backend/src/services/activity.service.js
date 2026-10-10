import { ActivityModel } from '../models/activity.model.js';
import { clientIp } from '../utils/request.js';
import { logger } from '../utils/logger.js';

/**
 * Records an audit entry for the signed-in administrator. Logging must never
 * break the action it describes, so failures are reported and swallowed.
 */
export async function logActivity(req, { entityType, entityId = null, action, details = null }, db) {
  try {
    await ActivityModel.create(
      { adminId: req.admin?.id ?? null, entityType, entityId, action, details, ip: clientIp(req) },
      db,
    );
  } catch (error) {
    logger.warn('Activity log failed', action, error.message);
  }
}
