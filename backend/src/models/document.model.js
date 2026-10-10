import { pool } from '../config/database.js';
import { likeTerm } from '../utils/pagination.js';

export const DocumentModel = {
  async create({ applicationId, docType, originalName, storedName, mimeType, sizeBytes }, db = pool) {
    const [result] = await db.execute(
      `INSERT INTO application_documents
         (application_id, doc_type, original_name, stored_name, mime_type, size_bytes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [applicationId, docType, originalName, storedName, mimeType, sizeBytes],
    );
    return result.insertId;
  },

  async listForApplication(applicationId, db = pool) {
    const [rows] = await db.execute(
      `SELECT id, doc_type, original_name, mime_type, size_bytes, created_at
         FROM application_documents WHERE application_id = ?
        ORDER BY (doc_type = 'cv') DESC, id ASC`,
      [applicationId],
    );
    return rows;
  },

  async storedNamesForApplication(applicationId, db = pool) {
    const [rows] = await db.execute(
      'SELECT stored_name FROM application_documents WHERE application_id = ?',
      [applicationId],
    );
    return rows.map((row) => row.stored_name);
  },

  async findForApplication(applicationId, documentId, db = pool) {
    const [rows] = await db.execute(
      `SELECT id, application_id, doc_type, original_name, stored_name, mime_type, size_bytes
         FROM application_documents WHERE id = ? AND application_id = ?`,
      [documentId, applicationId],
    );
    return rows[0] || null;
  },

  async list({ q, docType, page, limit }, db = pool) {
    const clauses = [];
    const params = {};
    if (q) {
      clauses.push('(d.original_name LIKE :q OR a.full_name LIKE :q OR a.reference_no LIKE :q)');
      params.q = likeTerm(q);
    }
    if (docType) {
      clauses.push('d.doc_type = :docType');
      params.docType = docType;
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT d.id, d.application_id, d.doc_type, d.original_name, d.mime_type, d.size_bytes, d.created_at,
              a.full_name, a.reference_no, a.status
         FROM application_documents d
         JOIN applications a ON a.id = d.application_id
         ${where}
        ORDER BY d.created_at DESC, d.id DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      params,
    );
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM application_documents d
         JOIN applications a ON a.id = d.application_id ${where}`,
      params,
    );
    return { rows, total: Number(countRows[0].total) };
  },
};
