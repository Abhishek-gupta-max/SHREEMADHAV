// Thin wrapper around fetch for the REST API.
//
// The API returns { success, message, data, meta? } on success and
// { success: false, message, errorCode, errors? } on failure. Failures are
// thrown as ApiError so callers can show `message` and field-level `errors`.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, errorCode = 'NETWORK_ERROR', errors = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
    this.errors = errors;
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

function buildUrl(path, params) {
  const url = `${BASE_URL}${path}`;
  if (!params) return url;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const query = search.toString();
  return query ? `${url}?${query}` : url;
}

let unauthorizedHandler = null;

/** Registered by AuthContext so expired admin sessions redirect to login. */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

export async function request(path, { method = 'GET', body, params, signal, headers } = {}) {
  const isForm = body instanceof FormData;
  let response;

  try {
    response = await fetch(buildUrl(path, params), {
      method,
      credentials: 'include',
      signal,
      headers: {
        Accept: 'application/json',
        ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Network error');
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    if (response.status === 401 && unauthorizedHandler && path !== '/auth/login') unauthorizedHandler();
    throw new ApiError(payload?.message || `Request failed (${response.status})`, {
      status: response.status,
      errorCode: payload?.errorCode || 'HTTP_ERROR',
      errors: payload?.errors || null,
    });
  }

  return payload;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export function apiUrl(path) {
  return buildUrl(path);
}

/**
 * Multipart upload with progress reporting. fetch() cannot report upload
 * progress, so this uses XMLHttpRequest.
 */
export function upload(path, formData, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', buildUrl(path));
    xhr.withCredentials = true;
    xhr.setRequestHeader('Accept', 'application/json');

    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      });
    }

    xhr.addEventListener('load', () => {
      let payload = null;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        payload = null;
      }
      if (xhr.status >= 200 && xhr.status < 300 && payload?.success !== false) return resolve(payload);
      reject(
        new ApiError(payload?.message || `Request failed (${xhr.status})`, {
          status: xhr.status,
          errorCode: payload?.errorCode || 'HTTP_ERROR',
          errors: payload?.errors || null,
        }),
      );
    });
    xhr.addEventListener('error', () => reject(new ApiError('Network error')));
    xhr.addEventListener('timeout', () => reject(new ApiError('Network error')));
    xhr.timeout = 120_000;
    xhr.send(formData);
  });
}
