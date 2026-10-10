import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';
import { ALLOWED_DOCUMENT_TYPES, CV_MIME_TYPES } from '../config/constants.js';
import { logger } from '../utils/logger.js';

// File signatures ("magic numbers"). Browser-supplied MIME types and file
// extensions are untrusted, so the real type is decided from the bytes.
const SIGNATURES = [
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'application/msword', bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] },
  {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    bytes: [0x50, 0x4b, 0x03, 0x04],
    // A .docx is a ZIP archive; require the Word document part to be present.
    verify: (buffer) => buffer.includes('word/'),
  },
];

export function detectMimeType(buffer) {
  for (const signature of SIGNATURES) {
    const matches = signature.bytes.every((byte, index) => buffer[index] === byte);
    if (matches && (!signature.verify || signature.verify(buffer))) return signature.mime;
  }
  return null;
}

/**
 * Validates an uploaded file and returns an error message, or null when valid.
 * `kind` is 'cv' (PDF or Word) or 'supporting' (PDF, Word, JPG or PNG).
 */
export function validateUpload(file, kind) {
  if (!file?.buffer?.length) return 'The file is empty.';
  if (file.size > env.uploads.maxFileSize) {
    return `Each file must be ${Math.round(env.uploads.maxFileSize / 1024 / 1024)} MB or smaller.`;
  }

  const detected = detectMimeType(file.buffer);
  const allowed = kind === 'cv' ? CV_MIME_TYPES : Object.keys(ALLOWED_DOCUMENT_TYPES);
  if (!detected || !allowed.includes(detected)) {
    return kind === 'cv'
      ? 'Your CV must be a PDF or Word document.'
      : 'Supporting documents must be PDF, Word, JPG or PNG files.';
  }

  const extension = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_DOCUMENT_TYPES[detected].includes(extension)) {
    return 'The file extension does not match its content.';
  }
  return null;
}

/** Maps a stored name to an absolute path, refusing anything outside the upload dir. */
export function resolveStoredPath(storedName) {
  const absolutePath = path.resolve(env.uploads.dir, storedName);
  if (!absolutePath.startsWith(env.uploads.dir + path.sep)) throw new Error('Invalid stored file path');
  return absolutePath;
}

/** Writes a validated file under a random name and returns its metadata. */
export async function storeUpload(file) {
  const mimeType = detectMimeType(file.buffer);
  const extension = ALLOWED_DOCUMENT_TYPES[mimeType][0];
  const now = new Date();
  const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const storedName = `${folder}/${crypto.randomUUID()}${extension}`;

  const absolutePath = resolveStoredPath(storedName);
  await fsp.mkdir(path.dirname(absolutePath), { recursive: true });
  await fsp.writeFile(absolutePath, file.buffer, { flag: 'wx', mode: 0o640 });

  return {
    storedName,
    mimeType,
    sizeBytes: file.size,
    originalName: (file.originalname || `document${extension}`).slice(0, 255),
  };
}

export async function removeStoredFiles(storedNames) {
  await Promise.all(
    storedNames.map(async (storedName) => {
      try {
        await fsp.unlink(resolveStoredPath(storedName));
      } catch (error) {
        if (error.code !== 'ENOENT') logger.warn('Could not remove file', storedName, error.message);
      }
    }),
  );
}

export function storedFileExists(storedName) {
  return fs.existsSync(resolveStoredPath(storedName));
}

export function createStoredFileStream(storedName) {
  return fs.createReadStream(resolveStoredPath(storedName));
}
