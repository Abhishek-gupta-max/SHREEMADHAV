import { pool } from '../config/database.js';
import { likeTerm } from '../utils/pagination.js';

const COLUMNS = 'id, full_name, email, phone, enquiry_type, subject, message, status, created_at, updated_at';

export const EnquiryModel = {
  async create({ fullName, email, phone, enquiryType, subject, message, submittedIp }, db = pool) {
    const [result] = await db.execute(
      `INSERT INTO contact_enquiries (full_name, email, phone, enquiry_type, subject, message, submitted_ip)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fullName, email, phone || null, enquiryType, subject, message, submittedIp],
    );
    return result.insertId;
  },

  async list({ q, status, enquiryType, page, limit }, db = pool) {
    const clauses = [];
    const params = {};
    if (q) {
      clauses.push('(full_name LIKE :q OR email LIKE :q OR subject LIKE :q OR phone LIKE :q)');
      params.q = likeTerm(q);
    }
    if (status) {
      clauses.push('status = :status');
      params.status = status;
    }
    if (enquiryType) {
      clauses.push('enquiry_type = :enquiryType');
      params.enquiryType = enquiryType;
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT ${COLUMNS} FROM contact_enquiries ${where}
        ORDER BY created_at DESC, id DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      params,
    );
    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM contact_enquiries ${where}`, params);
    return { rows, total: Number(countRows[0].total) };
  },

  async findById(id, db = pool) {
    const [rows] = await db.execute(`SELECT ${COLUMNS} FROM contact_enquiries WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async updateStatus(id, status, db = pool) {
    const [result] = await db.execute('UPDATE contact_enquiries SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  },

  async remove(id, db = pool) {
    const [result] = await db.execute('DELETE FROM contact_enquiries WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async countByStatus(db = pool) {
    const [rows] = await db.query('SELECT status, COUNT(*) AS total FROM contact_enquiries GROUP BY status');
    return Object.fromEntries(rows.map((row) => [row.status, Number(row.total)]));
  },
};
