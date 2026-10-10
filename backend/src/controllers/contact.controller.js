import { EnquiryModel } from '../models/enquiry.model.js';
import { ApiError } from '../utils/ApiError.js';
import { created, deleted, ok } from '../utils/response.js';
import { paginationMeta } from '../utils/pagination.js';
import { clientIp } from '../utils/request.js';
import { logActivity } from '../services/activity.service.js';

const RECEIVED = 'Thank you. Your message has been received and our team will respond shortly.';

/* ---------------------------------------------------------------- public */

export async function create(req, res) {
  const { website, ...input } = req.body;
  // Automated submissions receive the normal response but are not stored.
  if (!website) await EnquiryModel.create({ ...input, submittedIp: clientIp(req) });
  return created(res, null, { message: RECEIVED });
}

/* ----------------------------------------------------------------- admin */

async function findOrFail(id) {
  const enquiry = await EnquiryModel.findById(id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found.');
  return enquiry;
}

export async function list(req, res) {
  const query = req.validatedQuery;
  const { rows, total } = await EnquiryModel.list(query);
  return ok(res, rows, { meta: paginationMeta({ page: query.page, limit: query.limit, total }) });
}

export async function show(req, res) {
  return ok(res, await findOrFail(req.params.id));
}

export async function update(req, res) {
  const { id } = req.params;
  const enquiry = await findOrFail(id);

  if (enquiry.status !== req.body.status) {
    await EnquiryModel.updateStatus(id, req.body.status);
    await logActivity(req, {
      entityType: 'enquiry',
      entityId: id,
      action: 'enquiry.status_changed',
      details: { from: enquiry.status, to: req.body.status, subject: enquiry.subject },
    });
  }
  return ok(res, { ...enquiry, status: req.body.status }, { message: 'Enquiry updated' });
}

export async function remove(req, res) {
  const { id } = req.params;
  const enquiry = await findOrFail(id);

  await EnquiryModel.remove(id);
  await logActivity(req, {
    entityType: 'enquiry',
    entityId: id,
    action: 'enquiry.deleted',
    details: { subject: enquiry.subject, from: enquiry.email },
  });
  return deleted(res, 'Enquiry deleted');
}
