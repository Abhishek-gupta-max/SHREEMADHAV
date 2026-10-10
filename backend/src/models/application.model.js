import { pool } from '../config/database.js';
import { likeTerm } from '../utils/pagination.js';

const LIST_COLUMNS = `
  a.id, a.reference_no, a.full_name, a.email, a.phone, a.city, a.country,
  a.preferred_country, a.preferred_sector, a.preferred_position, a.preferred_opportunity,
  a.experience, a.status, a.created_at, a.updated_at`;

const SORTABLE = {
  created_at: 'a.created_at',
  full_name: 'a.full_name',
  status: 'a.status',
  preferred_country: 'a.preferred_country',
  preferred_position: 'a.preferred_position',
  reference_no: 'a.reference_no',
};

const AGGREGATABLE = ['preferred_country', 'preferred_sector', 'preferred_opportunity'];

function buildFilters({ q, status, preferredCountry, preferredSector, opportunity, from, to }) {
  const clauses = [];
  const params = {};

  if (q) {
    clauses.push(`(a.full_name LIKE :q OR a.email LIKE :q OR a.phone LIKE :q
                   OR a.reference_no LIKE :q OR a.preferred_position LIKE :q)`);
    params.q = likeTerm(q);
  }
  if (status) {
    clauses.push('a.status = :status');
    params.status = status;
  }
  if (preferredCountry) {
    clauses.push('a.preferred_country = :preferredCountry');
    params.preferredCountry = preferredCountry;
  }
  if (preferredSector) {
    clauses.push('a.preferred_sector = :preferredSector');
    params.preferredSector = preferredSector;
  }
  if (opportunity) {
    clauses.push('a.preferred_opportunity = :opportunity');
    params.opportunity = opportunity;
  }
  if (from) {
    clauses.push('a.created_at >= :from');
    params.from = `${from} 00:00:00`;
  }
  if (to) {
    clauses.push('a.created_at <= :to');
    params.to = `${to} 23:59:59`;
  }

  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

export const ApplicationModel = {
  async create(data, db = pool) {
    const [result] = await db.execute(
      `INSERT INTO applications (
         reference_no, job_id, full_name, email, phone, date_of_birth, gender,
         city, state, country, qualification, experience, profession, preferred_opportunity,
         preferred_country, preferred_sector, preferred_position, message,
         consent_at, language, submitted_ip
       ) VALUES (
         :referenceNo, :jobId, :fullName, :email, :phone, :dateOfBirth, :gender,
         :city, :state, :country, :qualification, :experience, :profession, :preferredOpportunity,
         :preferredCountry, :preferredSector, :preferredPosition, :message,
         UTC_TIMESTAMP(), :language, :submittedIp
       )`,
      data,
    );
    return result.insertId;
  },

  async list({ page, limit, sort, order, ...filters }, db = pool) {
    const { where, params } = buildFilters(filters);
    const sortColumn = SORTABLE[sort] || SORTABLE.created_at;
    const direction = order === 'asc' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT ${LIST_COLUMNS},
              (SELECT COUNT(*) FROM application_documents d WHERE d.application_id = a.id) AS document_count
         FROM applications a
         ${where}
        ORDER BY ${sortColumn} ${direction}, a.id ${direction}
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      params,
    );
    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM applications a ${where}`, params);

    return { rows, total: Number(countRows[0].total) };
  },

  async findById(id, db = pool) {
    const [rows] = await db.execute(
      `SELECT a.*, j.title AS job_title, j.slug AS job_slug
         FROM applications a
         LEFT JOIN job_openings j ON j.id = a.job_id
        WHERE a.id = ?`,
      [id],
    );
    return rows[0] || null;
  },

  async updateStatus(id, status, db = pool) {
    const [result] = await db.execute(
      'UPDATE applications SET status = ?, status_changed_at = UTC_TIMESTAMP() WHERE id = ?',
      [status, id],
    );
    return result.affectedRows > 0;
  },

  async remove(id, db = pool) {
    const [result] = await db.execute('DELETE FROM applications WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async countByStatus(db = pool) {
    const [rows] = await db.query('SELECT status, COUNT(*) AS total FROM applications GROUP BY status');
    return Object.fromEntries(rows.map((row) => [row.status, Number(row.total)]));
  },

  async countSince(days, db = pool) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) AS total FROM applications WHERE created_at >= UTC_TIMESTAMP() - INTERVAL ? DAY',
      [days],
    );
    return Number(rows[0].total);
  },

  async dailyCounts(days, db = pool) {
    const [rows] = await db.execute(
      `SELECT DATE(created_at) AS day, COUNT(*) AS total
         FROM applications
        WHERE created_at >= UTC_DATE() - INTERVAL ? DAY
        GROUP BY DATE(created_at)
        ORDER BY day ASC`,
      [days - 1],
    );
    return rows.map((row) => ({ day: row.day, total: Number(row.total) }));
  },

  async topValues(column, limit = 5, db = pool) {
    if (!AGGREGATABLE.includes(column)) throw new Error(`Column ${column} cannot be aggregated`);
    const [rows] = await db.query(
      `SELECT ${column} AS label, COUNT(*) AS total
         FROM applications GROUP BY ${column} ORDER BY total DESC LIMIT ${Number(limit)}`,
    );
    return rows.map((row) => ({ label: row.label, total: Number(row.total) }));
  },

  async distinctValues(column, db = pool) {
    if (!AGGREGATABLE.includes(column)) throw new Error(`Column ${column} cannot be listed`);
    const [rows] = await db.query(`SELECT DISTINCT ${column} AS value FROM applications ORDER BY ${column} ASC`);
    return rows.map((row) => row.value);
  },

  async recent(limit = 6, db = pool) {
    const [rows] = await db.query(
      `SELECT ${LIST_COLUMNS} FROM applications a ORDER BY a.created_at DESC, a.id DESC LIMIT ${Number(limit)}`,
    );
    return rows;
  },
};
