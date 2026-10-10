const DEFAULT_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'PAYLOAD_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'VALIDATION_ERROR',
  429: 'TOO_MANY_REQUESTS',
};

/** An error that is safe to show to API clients. */
export class ApiError extends Error {
  constructor(statusCode, message, { errorCode, errors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode || DEFAULT_CODES[statusCode] || 'INTERNAL_ERROR';
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError(400, message, { errors });
  }

  static unauthorized(message = 'Please sign in to continue.') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You do not have permission to perform this action.') {
    return new ApiError(403, message);
  }

  static notFound(message = 'The requested resource was not found.') {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }

  /** `errors` is a { field: message } map the client can show next to inputs. */
  static validation(errors, message = 'Please correct the highlighted fields.') {
    return new ApiError(422, message, { errors });
  }
}
