import { pool } from '../config/database.js';

function parseDetails(row) {
  if (!row.details) return { ...row, details: null };
  try {
    return { ...row, details: JSON.parse(row.details) };
  } catch {
    return { ...row, details: null };
  }
}

export const ActivityModel = {
  async create({ adminId = null, entityType, entityId = null, action, details = null, ip = null }, db = pool) {
    await db.execute(
      `INSERT INTO activity_logs (admin_id, entity_type, entity_id, action, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, entityType, entityId, action, details ? JSON.stringify(details) : null, ip],
    );
  },

  async listForEntity(entityType, entityId, db = pool) {
    const [rows] = await db.execute(
      `SELECT l.id, l.action, l.details, l.created_at, l.admin_id, ad.name AS admin_name
         FROM activity_logs l
         LEFT JOIN admins ad ON ad.id = l.admin_id
        WHERE l.entity_type = ? AND l.entity_id = ?
        ORDER BY l.created_at DESC, l.id DESC`,
      [entityType, entityId],
    );
    return rows.map(parseDetails);
  },

  async recent(limit = 10, db = pool) {
    const [rows] = await db.query(
      `SELECT l.id, l.entity_type, l.entity_id, l.action, l.details, l.created_at,
              ad.name AS admin_name, a.reference_no, a.full_name AS candidate_name
         FROM activity_logs l
         LEFT JOIN admins ad ON ad.id = l.admin_id
         LEFT JOIN applications a ON l.entity_type = 'application' AND a.id = l.entity_id
        WHERE l.entity_type IN ('application', 'enquiry', 'job', 'service', 'settings')
        ORDER BY l.created_at DESC, l.id DESC
        LIMIT ${Number(limit)}`,
    );
    return rows.map(parseDetails);
  },
};
