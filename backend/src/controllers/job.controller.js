import { JobModel } from '../models/job.model.js';
import { ApiError } from '../utils/ApiError.js';
import { created, deleted, ok } from '../utils/response.js';
import { paginationMeta } from '../utils/pagination.js';
import { slugify } from '../utils/slug.js';
import { logActivity } from '../services/activity.service.js';

async function uniqueSlug(title, excludeId = 0) {
  const base = slugify(title, 'opening');
  let slug = base;
  for (let suffix = 2; await JobModel.slugExists(slug, excludeId); suffix += 1) slug = `${base}-${suffix}`;
  return slug;
}

const toRecord = (body) => ({
  title: body.title,
  country: body.country ?? null,
  location: body.location ?? null,
  sector: body.sector ?? null,
  employmentType: body.employmentType,
  summary: body.summary,
  requirements: body.requirements ?? null,
  status: body.status,
});

/* ---------------------------------------------------------------- public */

export async function listPublished(_req, res) {
  return ok(res, await JobModel.listPublished());
}

export async function showPublished(req, res) {
  const job = await JobModel.findPublishedBySlug(req.params.slug);
  if (!job) throw ApiError.notFound('This opening is no longer available.');
  return ok(res, job);
}

/* ----------------------------------------------------------------- admin */

async function findOrFail(id) {
  const job = await JobModel.findById(id);
  if (!job) throw ApiError.notFound('Opening not found.');
  return job;
}

export async function list(req, res) {
  const query = req.validatedQuery;
  const { rows, total } = await JobModel.list(query);
  return ok(res, rows, { meta: paginationMeta({ page: query.page, limit: query.limit, total }) });
}

export async function show(req, res) {
  return ok(res, await findOrFail(req.params.id));
}

export async function create(req, res) {
  const record = toRecord(req.body);
  const id = await JobModel.create({ ...record, slug: await uniqueSlug(record.title), createdBy: req.admin.id });
  await logActivity(req, { entityType: 'job', entityId: id, action: 'job.created', details: { title: record.title } });
  return created(res, await JobModel.findById(id), { message: 'Opening created' });
}

export async function update(req, res) {
  const { id } = req.params;
  const existing = await findOrFail(id);

  const record = toRecord(req.body);
  const slug = record.title === existing.title ? existing.slug : await uniqueSlug(record.title, id);
  await JobModel.update(id, { ...record, slug });
  await logActivity(req, {
    entityType: 'job',
    entityId: id,
    action: 'job.updated',
    details: { title: record.title, status: record.status },
  });
  return ok(res, await JobModel.findById(id), { message: 'Opening updated' });
}

export async function remove(req, res) {
  const { id } = req.params;
  const existing = await findOrFail(id);

  await JobModel.remove(id);
  await logActivity(req, { entityType: 'job', entityId: id, action: 'job.deleted', details: { title: existing.title } });
  return deleted(res, 'Opening deleted');
}
