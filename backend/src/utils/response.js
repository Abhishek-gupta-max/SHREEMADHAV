// Response envelope used by every endpoint:
//   success → { success: true,  message, data, meta? }
//   failure → { success: false, message, errorCode, errors? }   (see middleware/error.js)

export function ok(res, data = null, { message = 'OK', meta, status = 200, extra } = {}) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  if (extra) Object.assign(body, extra);
  return res.status(status).json(body);
}

export function created(res, data = null, options = {}) {
  return ok(res, data, { message: 'Created', ...options, status: 201 });
}

export function deleted(res, message = 'Deleted') {
  return ok(res, null, { message });
}
