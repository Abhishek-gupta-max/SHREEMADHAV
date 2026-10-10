import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Files stay in memory until their content has been verified, so rejected
// uploads never touch the disk. The per-file size limit bounds memory use.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.uploads.maxFileSize,
    files: env.uploads.maxSupportingFiles + 1,
    fields: 40,
    fieldSize: 16 * 1024,
  },
});

const sizeMb = Math.round(env.uploads.maxFileSize / 1024 / 1024);
const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: `Each file must be ${sizeMb} MB or smaller.`,
  LIMIT_FILE_COUNT: `You can upload a CV and up to ${env.uploads.maxSupportingFiles} supporting documents.`,
  LIMIT_UNEXPECTED_FILE: `You can upload a CV and up to ${env.uploads.maxSupportingFiles} supporting documents.`,
};

export function applicationUpload(req, res, next) {
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'documents', maxCount: env.uploads.maxSupportingFiles },
  ])(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const message = MULTER_MESSAGES[error.code] || 'The upload could not be processed.';
      const field = error.field === 'cv' ? 'cv' : 'documents';
      return next(
        new ApiError(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400, message, { errors: { [field]: message } }),
      );
    }
    return next(error);
  });
}
