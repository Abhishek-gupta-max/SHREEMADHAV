import { pool } from '../config/database.js';

const SELECT_NOTE = `
  SELECT n.id, n.body, n.created_at, n.admin_id, ad.name AS admin_name
    FROM admin_notes n
    LEFT JOIN admins ad ON ad.id = n.admin_id`;

export const NoteModel = {
  async create({ applicationId, adminId, body }, db = pool) {
    const [result] = await db.execute(
      'INSERT INTO admin_notes (application_id, admin_id, body) VALUES (?, ?, ?)',
      [applicationId, adminId, body],
    );
    return result.insertId;
  },

  async findById(id, db = pool) {
    const [rows] = await db.execute(`${SELECT_NOTE} WHERE n.id = ?`, [id]);
    return rows[0] || null;
  },

  async listForApplication(applicationId, db = pool) {
    const [rows] = await db.execute(
      `${SELECT_NOTE} WHERE n.application_id = ? ORDER BY n.created_at DESC, n.id DESC`,
      [applicationId],
    );
    return rows;
  },
};
