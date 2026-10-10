import { pool } from '../config/database.js';
import { SETTING_KEYS } from '../config/constants.js';

export const SettingModel = {
  /** Returns every known key, with null for unset values. */
  async getAll(db = pool) {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM site_settings');
    const stored = Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value]));
    return Object.fromEntries(SETTING_KEYS.map((key) => [key, stored[key] || null]));
  },

  async upsertMany(values, adminId, db = pool) {
    for (const [key, value] of Object.entries(values)) {
      await db.execute(
        `INSERT INTO site_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`,
        [key, value || null, adminId],
      );
    }
  },
};
