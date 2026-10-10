// Creates the database if needed and applies database/schema.sql.
// Usage: npm run db:migrate
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { env } from '../src/config/env.js';

async function migrate() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true,
  });

  try {
    const name = env.db.database.replace(/`/g, '');
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await connection.query(`USE \`${name}\``);
    await connection.query(fs.readFileSync(path.join(env.rootDir, 'database', 'schema.sql'), 'utf8'));

    const [tables] = await connection.query('SHOW TABLES');
    console.log(`Database "${name}" is ready (${tables.length} tables).`);
  } finally {
    await connection.end();
  }
}

migrate().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
