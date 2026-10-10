import { pool } from '../config/database.js';
import { likeTerm } from '../utils/pagination.js';

const PUBLIC_COLUMNS = `id, title, slug, country, location, sector, employment_type, summary,
                        requirements, published_at`;

export const JobModel = {
  async listPublished(db = pool) {
    const [rows] = await db.query(
      `SELECT ${PUBLIC_COLUMNS} FROM job_openings
        WHERE status = 'published' ORDER BY published_at DESC, id DESC`,
    );
    return rows;
  },

  async findPublishedBySlug(slug, db = pool) {
    const [rows] = await db.execute(
      `SELECT ${PUBLIC_COLUMNS} FROM job_openings WHERE slug = ? AND status = 'published'`,
      [slug],
    );
    return rows[0] || null;
  },

  async isPublished(id, db = pool) {
    const [rows] = await db.execute(`SELECT id FROM job_openings WHERE id = ? AND status = 'published'`, [id]);
    return rows.length > 0;
  },

  async list({ q, status, page, limit }, db = pool) {
    const clauses = [];
    const params = {};
    if (q) {
      clauses.push('(j.title LIKE :q OR j.country LIKE :q OR j.sector LIKE :q)');
      params.q = likeTerm(q);
    }
    if (status) {
      clauses.push('j.status = :status');
      params.status = status;
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT j.*, (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS application_count
         FROM job_openings j ${where}
        ORDER BY j.updated_at DESC, j.id DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      params,
    );
    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM job_openings j ${where}`, params);
    return { rows, total: Number(countRows[0].total) };
  },

  async findById(id, db = pool) {
    const [rows] = await db.execute('SELECT * FROM job_openings WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async slugExists(slug, excludeId = 0, db = pool) {
    const [rows] = await db.execute('SELECT id FROM job_openings WHERE slug = ? AND id <> ?', [slug, excludeId]);
    return rows.length > 0;
  },

  async create(data, db = pool) {
    const [result] = await db.execute(
      `INSERT INTO job_openings
         (title, slug, country, location, sector, employment_type, summary, requirements, status,
          published_at, created_by)
       VALUES (:title, :slug, :country, :location, :sector, :employmentType, :summary, :requirements,
               :status, IF(:status = 'published', UTC_TIMESTAMP(), NULL), :createdBy)`,
      data,
    );
    return result.insertId;
  },

  async update(id, data, db = pool) {
    await db.execute(
      `UPDATE job_openings
          SET title = :title, slug = :slug, country = :country, location = :location, sector = :sector,
              employment_type = :employmentType, summary = :summary, requirements = :requirements,
              published_at = IF(:status = 'published' AND published_at IS NULL, UTC_TIMESTAMP(), published_at),
              status = :status
        WHERE id = :id`,
      { ...data, id },
    );
  },

  async remove(id, db = pool) {
    const [result] = await db.execute('DELETE FROM job_openings WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
