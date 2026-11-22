import { api, upload } from './api.js';

// Endpoints used by the public website.

export const publicService = {
  services: (lang, options) => api.get('/services', { ...options, params: { lang } }).then((r) => r.data),
  settings: (options) => api.get('/settings', options).then((r) => r.data),
  jobs: (options) => api.get('/jobs', options).then((r) => r.data),
  job: (slug, options) => api.get(`/jobs/${encodeURIComponent(slug)}`, options).then((r) => r.data),

  /** Sends the multipart application. Resolves with the application ID. */
  submitApplication: (formData, { onProgress } = {}) =>
    upload('/applications', formData, { onProgress }).then((r) => r.applicationId || r.data?.applicationId),

  sendEnquiry: (payload) => api.post('/contact', payload),
  sendEmployerEnquiry: (payload) => api.post('/employer-enquiries', payload),
};
