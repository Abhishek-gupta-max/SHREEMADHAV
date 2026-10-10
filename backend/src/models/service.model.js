import { pool } from '../config/database.js';
import { DEFAULT_LOCALE } from '../config/constants.js';

/** Groups translation rows under their service: { en: {...}, hi: {...} }. */
function groupTranslations(rows) {
  const byService = new Map();
  for (const row of rows) {
    if (!byService.has(row.service_id)) byService.set(row.service_id, {});
    byService.get(row.service_id)[row.locale] = { title: row.title, summary: row.summary, body: row.body };
  }
  return byService;
}

const toService = (row, translations = {}) => ({
  id: row.id,
  slug: row.slug,
  icon: row.icon,
  sortOrder: row.sort_order,
  isFeatured: Boolean(row.is_featured),
  isActive: Boolean(row.is_active),
  updatedAt: row.updated_at,
  translations,
});

export const ServiceModel = {
  /** Active services in one language, falling back to English per field set. */
  async listPublic(locale, db = pool) {
    const [rows] = await db.execute(
      `SELECT s.id, s.slug, s.icon, s.is_featured,
              COALESCE(t.title, en.title) AS title,
              COALESCE(t.summary, en.summary) AS summary,
              COALESCE(t.body, en.body) AS body
         FROM services s
         JOIN service_translations en ON en.service_id = s.id AND en.locale = ?
         LEFT JOIN service_translations t ON t.service_id = s.id AND t.locale = ?
        WHERE s.is_active = 1
        ORDER BY s.sort_order ASC, s.id ASC`,
      [DEFAULT_LOCALE, locale],
    );
    return rows.map((row) => ({ ...row, is_featured: Boolean(row.is_featured) }));
  },

  async listAll(db = pool) {
    const [services] = await db.query('SELECT * FROM services ORDER BY sort_order ASC, id ASC');
    const [translations] = await db.query('SELECT * FROM service_translations');
    const grouped = groupTranslations(translations);
    return services.map((row) => toService(row, grouped.get(row.id)));
  },

  async findById(id, db = pool) {
    const [rows] = await db.execute('SELECT * FROM services WHERE id = ?', [id]);
    if (!rows[0]) return null;
    const [translations] = await db.execute('SELECT * FROM service_translations WHERE service_id = ?', [id]);
    return toService(rows[0], groupTranslations(translations).get(rows[0].id));
  },

  async slugExists(slug, excludeId = 0, db = pool) {
    const [rows] = await db.execute('SELECT id FROM services WHERE slug = ? AND id <> ?', [slug, excludeId]);
    return rows.length > 0;
  },

  async create({ slug, icon, sortOrder, isFeatured, isActive }, db = pool) {
    const [result] = await db.execute(
      'INSERT INTO services (slug, icon, sort_order, is_featured, is_active) VALUES (?, ?, ?, ?, ?)',
      [slug, icon, sortOrder, isFeatured ? 1 : 0, isActive ? 1 : 0],
    );
    return result.insertId;
  },

  async update(id, { slug, icon, sortOrder, isFeatured, isActive }, db = pool) {
    await db.execute(
      'UPDATE services SET slug = ?, icon = ?, sort_order = ?, is_featured = ?, is_active = ? WHERE id = ?',
      [slug, icon, sortOrder, isFeatured ? 1 : 0, isActive ? 1 : 0, id],
    );
  },

  /** Replaces all translations of a service with the given { locale: {...} } map. */
  async replaceTranslations(serviceId, translations, db = pool) {
    await db.execute('DELETE FROM service_translations WHERE service_id = ?', [serviceId]);
    for (const [locale, copy] of Object.entries(translations)) {
      if (!copy) continue;
      await db.execute(
        'INSERT INTO service_translations (service_id, locale, title, summary, body) VALUES (?, ?, ?, ?, ?)',
        [serviceId, locale, copy.title, copy.summary, copy.body || null],
      );
    }
  },

  async remove(id, db = pool) {
    const [result] = await db.execute('DELETE FROM services WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
