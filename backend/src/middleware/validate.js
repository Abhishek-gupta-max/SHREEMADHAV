import { ApiError } from '../utils/ApiError.js';

/** Converts Zod issues into a flat { field: message } map. */
export function issuesToFieldErrors(issues) {
  const errors = {};
  for (const issue of issues) {
    const key = issue.path.join('.') || '_';
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/**
 * Validates req[source] and replaces it with the parsed (trimmed, coerced)
 * value. Express 5 exposes req.query through a read-only getter, so parsed
 * query values go to req.validatedQuery instead.
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) throw ApiError.validation(issuesToFieldErrors(result.error.issues));
    if (source === 'query') req.validatedQuery = result.data;
    else req[source] = result.data;
    next();
  };
}
