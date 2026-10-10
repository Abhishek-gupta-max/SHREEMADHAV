import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist.`));
}

/** Central error handler. Never leaks internals: unknown errors become a generic 500. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, _next) {
  let apiError = error;

  if (!(error instanceof ApiError)) {
    if (error?.type === 'entity.parse.failed') {
      apiError = ApiError.badRequest('The request body is not valid JSON.');
    } else if (error?.type === 'entity.too.large') {
      apiError = new ApiError(413, 'The request is too large.');
    } else if (error?.code === 'ER_DUP_ENTRY') {
      apiError = ApiError.conflict('A record with the same unique value already exists.');
    } else {
      logger.error(`${req.method} ${req.originalUrl}`, error);
      apiError = new ApiError(500, 'Something went wrong on our side. Please try again later.');
    }
  } else if (apiError.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl}`, error);
  }

  const body = { success: false, message: apiError.message, errorCode: apiError.errorCode };
  if (apiError.errors) body.errors = apiError.errors;
  if (!env.isProduction && apiError.statusCode >= 500 && !(error instanceof ApiError)) {
    body.debug = error?.message;
  }

  res.status(apiError.statusCode).json(body);
}
