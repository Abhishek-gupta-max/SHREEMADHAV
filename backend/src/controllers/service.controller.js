import { withTransaction } from '../config/database.js';
import { ServiceModel } from '../models/service.model.js';
import { ApiError } from '../utils/ApiError.js';
import { created, deleted, ok } from '../utils/response.js';
import { logActivity } from '../services/activity.service.js';

/* ---------------------------------------------------------------- public */

export async function listPublic(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300');
  return ok(res, await ServiceModel.listPublic(req.validatedQuery.lang));
}

/* ----------------------------------------------------------------- admin */

async function findOrFail(id) {
  const service = await ServiceModel.findById(id);
  if (!service) throw ApiError.notFound('Service not found.');
  return service;
}

async function assertSlugAvailable(slug, excludeId) {
  if (await ServiceModel.slugExists(slug, excludeId)) {
    throw ApiError.validation({ slug: 'Another service already uses this URL name' });
  }
}

export async function list(_req, res) {
  return ok(res, await ServiceModel.listAll());
}

export async function show(req, res) {
  return ok(res, await findOrFail(req.params.id));
}

export async function create(req, res) {
  const { translations, ...fields } = req.body;
  await assertSlugAvailable(fields.slug);

  const id = await withTransaction(async (db) => {
    const serviceId = await ServiceModel.create(fields, db);
    await ServiceModel.replaceTranslations(serviceId, translations, db);
    return serviceId;
  });
  await logActivity(req, {
    entityType: 'service',
    entityId: id,
    action: 'service.created',
    details: { title: translations.en.title },
  });

  return created(res, await ServiceModel.findById(id), { message: 'Service created' });
}

export async function update(req, res) {
  const { id } = req.params;
  await findOrFail(id);
  const { translations, ...fields } = req.body;
  await assertSlugAvailable(fields.slug, id);

  await withTransaction(async (db) => {
    await ServiceModel.update(id, fields, db);
    await ServiceModel.replaceTranslations(id, translations, db);
  });
  await logActivity(req, {
    entityType: 'service',
    entityId: id,
    action: 'service.updated',
    details: { title: translations.en.title },
  });

  return ok(res, await ServiceModel.findById(id), { message: 'Service updated' });
}

export async function remove(req, res) {
  const { id } = req.params;
  const service = await findOrFail(id);

  await ServiceModel.remove(id);
  await logActivity(req, {
    entityType: 'service',
    entityId: id,
    action: 'service.deleted',
    details: { title: service.translations.en?.title },
  });
  return deleted(res, 'Service deleted');
}
