import { pool } from '../config/database.js';

export const EmployerModel = {
  async create({ companyName, contactPerson, email, phone, country, industry, requirements, numEmployees, message, submittedIp }) {
    const [result] = await pool.execute(
      `INSERT INTO employer_enquiries
        (company_name, contact_person, email, phone, country, industry, requirements, num_employees, message, submitted_ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyName, contactPerson, email, phone, country, industry, requirements, numEmployees, message || null, submittedIp || null],
    );
    return result.insertId;
  },

  async list({ page = 1, limit = 20, status } = {}) {
    const offset = (page - 1) * limit;
    const where = status ? 'WHERE status = ?' : '';
    const params = status ? [status, limit, offset] : [limit, offset];
    const [rows] = await pool.execute(
      `SELECT * FROM employer_enquiries ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      params,
    );
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM employer_enquiries ${where}`,
      status ? [status] : [],
    );
    return { rows, total };
  },

  async findById(id) {
    const [[row]] = await pool.execute('SELECT * FROM employer_enquiries WHERE id = ?', [id]);
    return row || null;
  },

  async updateStatus(id, status) {
    await pool.execute('UPDATE employer_enquiries SET status = ? WHERE id = ?', [status, id]);
  },

  async remove(id) {
    await pool.execute('DELETE FROM employer_enquiries WHERE id = ?', [id]);
  },
};
