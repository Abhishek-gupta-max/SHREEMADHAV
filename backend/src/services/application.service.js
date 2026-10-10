import { withTransaction } from '../config/database.js';
import { ApplicationModel } from '../models/application.model.js';
import { DocumentModel } from '../models/document.model.js';
import { ActivityModel } from '../models/activity.model.js';
import { ReferenceModel } from '../models/reference.model.js';
import { JobModel } from '../models/job.model.js';
import { ApiError } from '../utils/ApiError.js';
import { removeStoredFiles, storeUpload, validateUpload } from './file.service.js';

export const REFERENCE_PREFIX = 'SMOS';

export function formatReference(year, sequence) {
  return `${REFERENCE_PREFIX}-${year}-${String(sequence).padStart(5, '0')}`;
}

/** Checks every uploaded file before anything is written to disk. */
export function validateApplicationFiles(files = {}) {
  const errors = {};
  const cv = files.cv?.[0];
  const supporting = files.documents || [];

  if (!cv) {
    errors.cv = 'Please attach your CV or resume.';
  } else {
    const message = validateUpload(cv, 'cv');
    if (message) errors.cv = message;
  }

  for (const file of supporting) {
    const message = validateUpload(file, 'supporting');
    if (message) {
      errors.documents = `${file.originalname}: ${message}`;
      break;
    }
  }

  if (Object.keys(errors).length) throw ApiError.validation(errors);
  return { cv, supporting };
}

/**
 * Saves an application and its documents in one transaction and returns the
 * issued application ID. Files already written are deleted if the transaction
 * fails, so storage never keeps orphaned uploads.
 */
export async function submitApplication(input, files, { ip }) {
  const { cv, supporting } = validateApplicationFiles(files);

  if (input.jobId && !(await JobModel.isPublished(input.jobId))) {
    throw ApiError.validation({ jobId: 'This position is no longer accepting applications.' });
  }

  const stored = [];
  try {
    stored.push({ docType: 'cv', ...(await storeUpload(cv)) });
    for (const file of supporting) stored.push({ docType: 'supporting', ...(await storeUpload(file)) });

    return await withTransaction(async (db) => {
      const year = new Date().getUTCFullYear();
      const referenceNo = formatReference(year, await ReferenceModel.next(db, year));

      const applicationId = await ApplicationModel.create(
        { ...input, jobId: input.jobId ?? null, message: input.message || null, referenceNo, submittedIp: ip },
        db,
      );

      for (const document of stored) {
        await DocumentModel.create({ applicationId, ...document }, db);
      }

      await ActivityModel.create(
        {
          entityType: 'application',
          entityId: applicationId,
          action: 'application.submitted',
          details: { referenceNo, documents: stored.length },
          ip,
        },
        db,
      );

      return { id: applicationId, referenceNo };
    });
  } catch (error) {
    await removeStoredFiles(stored.map((document) => document.storedName));
    throw error;
  }
}
