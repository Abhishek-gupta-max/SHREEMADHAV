import { withTransaction } from '../config/database.js';
import { ApplicationModel } from '../models/application.model.js';
import { DocumentModel } from '../models/document.model.js';
import { NoteModel } from '../models/note.model.js';
import { ActivityModel } from '../models/activity.model.js';
import { ApiError } from '../utils/ApiError.js';
import { created, deleted, ok } from '../utils/response.js';
import { paginationMeta } from '../utils/pagination.js';
import { clientIp } from '../utils/request.js';
import { safeFileName } from '../utils/sanitize.js';
import { logActivity } from '../services/activity.service.js';
import { submitApplication } from '../services/application.service.js';
import { createStoredFileStream, removeStoredFiles, storedFileExists } from '../services/file.service.js';

/* ---------------------------------------------------------------- public */

export async function create(req, res) {
  const { website, ...input } = req.body;
  if (website) throw ApiError.badRequest('The application could not be submitted.');

  const { referenceNo } = await submitApplication(input, req.files, { ip: clientIp(req) });

  return created(
    res,
    { applicationId: referenceNo },
    { message: 'Application submitted successfully', extra: { applicationId: referenceNo } },
  );
}

/* ----------------------------------------------------------------- admin */

async function findOrFail(id) {
  const application = await ApplicationModel.findById(id);
  if (!application) throw ApiError.notFound('Application not found.');
  return application;
}

export async function list(req, res) {
  const query = req.validatedQuery;
  const [{ rows, total }, statusCounts] = await Promise.all([
    ApplicationModel.list(query),
    ApplicationModel.countByStatus(),
  ]);
  return ok(res, rows, { meta: { ...paginationMeta({ page: query.page, limit: query.limit, total }), statusCounts } });
}

/** Values present in the data, used to populate admin filter dropdowns. */
export async function filterOptions(_req, res) {
  const [countries, sectors] = await Promise.all([
    ApplicationModel.distinctValues('preferred_country'),
    ApplicationModel.distinctValues('preferred_sector'),
  ]);
  return ok(res, { countries, sectors });
}

export async function show(req, res) {
  const { id } = req.params;
  const application = await findOrFail(id);

  const [documents, notes, activity] = await Promise.all([
    DocumentModel.listForApplication(id),
    NoteModel.listForApplication(id),
    ActivityModel.listForEntity('application', id),
  ]);

  const { submitted_ip: _ip, ...fields } = application;
  return ok(res, { application: fields, documents, notes, activity });
}

export async function update(req, res) {
  const { id } = req.params;
  const { status, note } = req.body;
  const application = await findOrFail(id);

  if (application.status === status && !note) {
    return ok(res, { status }, { message: 'No changes to save' });
  }

  await withTransaction(async (db) => {
    if (application.status !== status) {
      await ApplicationModel.updateStatus(id, status, db);
      await logActivity(
        req,
        {
          entityType: 'application',
          entityId: id,
          action: 'application.status_changed',
          details: { from: application.status, to: status },
        },
        db,
      );
    }
    if (note) {
      await NoteModel.create({ applicationId: id, adminId: req.admin.id, body: note }, db);
      await logActivity(req, { entityType: 'application', entityId: id, action: 'application.note_added' }, db);
    }
  });

  return ok(res, { status }, { message: 'Application updated' });
}

export async function remove(req, res) {
  const { id } = req.params;
  const application = await findOrFail(id);
  const storedNames = await DocumentModel.storedNamesForApplication(id);

  await ApplicationModel.remove(id);
  await removeStoredFiles(storedNames);
  await logActivity(req, {
    entityType: 'application',
    entityId: id,
    action: 'application.deleted',
    details: { referenceNo: application.reference_no, candidate: application.full_name },
  });

  return deleted(res, 'Application deleted');
}

export async function addNote(req, res) {
  const { id } = req.params;
  await findOrFail(id);

  const noteId = await NoteModel.create({ applicationId: id, adminId: req.admin.id, body: req.body.body });
  await logActivity(req, { entityType: 'application', entityId: id, action: 'application.note_added' });

  return created(res, await NoteModel.findById(noteId), { message: 'Note added' });
}

/** Streams a stored document. Files are never served from a public folder. */
export async function downloadDocument(req, res) {
  const { id, documentId } = req.params;
  const document = await DocumentModel.findForApplication(id, documentId);
  if (!document || !storedFileExists(document.stored_name)) throw ApiError.notFound('Document not found.');

  await logActivity(req, {
    entityType: 'application',
    entityId: id,
    action: 'application.document_viewed',
    details: { document: document.original_name },
  });

  const disposition = req.query.inline === '1' ? 'inline' : 'attachment';
  res.setHeader('Content-Type', document.mime_type);
  res.setHeader('Content-Length', document.size_bytes);
  res.setHeader(
    'Content-Disposition',
    `${disposition}; filename="${safeFileName(document.original_name)}"; filename*=UTF-8''${encodeURIComponent(document.original_name)}`,
  );
  res.setHeader('Cache-Control', 'private, no-store');

  createStoredFileStream(document.stored_name).pipe(res);
}

export async function listDocuments(req, res) {
  const query = req.validatedQuery;
  const { rows, total } = await DocumentModel.list(query);
  return ok(res, rows, { meta: paginationMeta({ page: query.page, limit: query.limit, total }) });
}
