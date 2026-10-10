import fs from 'node:fs';
import { env } from './src/config/env.js';
import { pool, verifyDatabaseConnection } from './src/config/database.js';
import { createApp } from './src/app.js';
import { logger } from './src/utils/logger.js';

async function start() {
  fs.mkdirSync(env.uploads.dir, { recursive: true });

  // MySQL often starts after the API (reboots, containers), so wait for it briefly.
  const attempts = 10;
  for (let attempt = 1; ; attempt += 1) {
    try {
      await verifyDatabaseConnection();
      break;
    } catch (error) {
      const where = `MySQL at ${env.db.host}:${env.db.port}`;
      if (attempt >= attempts) {
        logger.error(`Cannot connect to ${where}: ${error.message}. Is the database server running?`);
        process.exit(1);
      }
      logger.warn(`Waiting for ${where} (${error.code || error.message}), attempt ${attempt}/${attempts}…`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  const server = createApp().listen(env.port, () => {
    logger.info(`API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection', reason));
}

start();
