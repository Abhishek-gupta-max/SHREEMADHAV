import { pool } from '../config/database.js';

const COLUMNS =
  'id, name, email, password_hash, role, is_active, token_version, last_login_at, created_at, updated_at';

export const AdminModel = {
  async findById(id, db = pool) {
    const [rows] = await db.execute(`SELECT ${COLUMNS} FROM admins WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async findByEmail(email, db = pool) {
    const [rows] = await db.execute(`SELECT ${COLUMNS} FROM admins WHERE email = ?`, [email]);
    return rows[0] || null;
  },

  async list(db = pool) {
    const [rows] = await db.query(
      `SELECT id, name, email, role, is_active, last_login_at, created_at
         FROM admins ORDER BY is_active DESC, name ASC`,
    );
    return rows.map((row) => ({ ...row, is_active: Boolean(row.is_active) }));
  },

  async create({ name, email, passwordHash, role }, db = pool) {
    const [result] = await db.execute(
      'INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role],
    );
    return result.insertId;
  },

  async updateProfile(id, { name, email }, db = pool) {
    await db.execute('UPDATE admins SET name = ?, email = ? WHERE id = ?', [name, email, id]);
  },

  /** Also bumps token_version, which signs the account out everywhere. */
  async updatePassword(id, passwordHash, db = pool) {
    await db.execute(
      'UPDATE admins SET password_hash = ?, token_version = token_version + 1 WHERE id = ?',
      [passwordHash, id],
    );
  },

  /** Deactivating an account also revokes its existing sessions. */
  async updateAccess(id, { role, isActive }, db = pool) {
    await db.execute(
      'UPDATE admins SET role = ?, is_active = ?, token_version = token_version + ? WHERE id = ?',
      [role, isActive ? 1 : 0, isActive ? 0 : 1, id],
    );
  },

  async touchLogin(id, db = pool) {
    await db.execute('UPDATE admins SET last_login_at = UTC_TIMESTAMP() WHERE id = ?', [id]);
  },

  async incrementTokenVersion(id, db = pool) {
    await db.execute('UPDATE admins SET token_version = token_version + 1 WHERE id = ?', [id]);
  },

  async countActiveSuperAdmins(db = pool) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total FROM admins WHERE role = 'super_admin' AND is_active = 1`,
    );
    return Number(rows[0].total);
  },

  toPublic(admin) {
    if (!admin) return null;
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      lastLoginAt: admin.last_login_at,
      createdAt: admin.created_at,
    };
  },
};
