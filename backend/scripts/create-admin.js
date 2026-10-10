// Creates a super administrator, or resets the password if the email exists.
//
//   npm run admin:create
//
// Reads ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD from .env (or the shell).
// Remove ADMIN_PASSWORD from .env once the account has been created.
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/database.js';
import { password as passwordRule } from '../src/validators/common.js';

const name = process.env.ADMIN_NAME?.trim() || 'Site Administrator';
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

async function main() {
  if (!email || !password) {
    console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set; skipping administrator creation.');
    return;
  }
  const check = passwordRule.safeParse(password);
  if (!check.success) throw new Error(`ADMIN_PASSWORD: ${check.error.issues[0].message}`);

  const passwordHash = await bcrypt.hash(password, 12);
  const [existing] = await pool.execute('SELECT id FROM admins WHERE email = ?', [email]);

  if (existing.length) {
    await pool.execute(
      `UPDATE admins SET password_hash = ?, role = 'super_admin', is_active = 1,
              token_version = token_version + 1 WHERE id = ?`,
      [passwordHash, existing[0].id],
    );
    console.log(`Password reset for ${email}.`);
  } else {
    await pool.execute(`INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, 'super_admin')`, [
      name,
      email,
      passwordHash,
    ]);
    console.log(`Super administrator ${email} created.`);
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
