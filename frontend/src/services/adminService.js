import { api, apiUrl } from './api.js';

// Back-office endpoints. All require an authenticated session cookie.

const list = (path) => (params, options) => api.get(path, { ...options, params });

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials).then((r) => r.data.admin),
  logout: () => api.post('/auth/logout'),
  logoutEverywhere: () => api.post('/auth/logout-all'),
  me: (options) => api.get('/auth/me', options).then((r) => r.data.admin),
  session: (options) => api.get('/auth/session', options).then((r) => r.data.admin),
  updateProfile: (payload) => api.patch('/auth/profile', payload),
  changePassword: (payload) => api.patch('/auth/password', payload),
};

export const adminService = {
  dashboard: (options) => api.get('/admin/dashboard', options).then((r) => r.data),

  applications: list('/admin/applications'),
  applicationFilters: (options) => api.get('/admin/applications/filters', options).then((r) => r.data),
  application: (id, options) => api.get(`/admin/applications/${id}`, options).then((r) => r.data),
  updateApplication: (id, payload) => api.patch(`/admin/applications/${id}`, payload),
  deleteApplication: (id) => api.delete(`/admin/applications/${id}`),
  addNote: (id, body) => api.post(`/admin/applications/${id}/notes`, { body }),
  documentUrl: (applicationId, documentId, { inline = false } = {}) =>
    apiUrl(`/admin/applications/${applicationId}/documents/${documentId}${inline ? '?inline=1' : ''}`),

  documents: list('/admin/documents'),

  enquiries: list('/admin/enquiries'),
  updateEnquiry: (id, payload) => api.patch(`/admin/enquiries/${id}`, payload),
  deleteEnquiry: (id) => api.delete(`/admin/enquiries/${id}`),

  services: (options) => api.get('/admin/services', options).then((r) => r.data),
  service: (id, options) => api.get(`/admin/services/${id}`, options).then((r) => r.data),
  createService: (payload) => api.post('/admin/services', payload),
  updateService: (id, payload) => api.put(`/admin/services/${id}`, payload),
  deleteService: (id) => api.delete(`/admin/services/${id}`),

  jobs: list('/admin/jobs'),
  job: (id, options) => api.get(`/admin/jobs/${id}`, options).then((r) => r.data),
  createJob: (payload) => api.post('/admin/jobs', payload),
  updateJob: (id, payload) => api.put(`/admin/jobs/${id}`, payload),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),

  settings: (options) => api.get('/admin/settings', options).then((r) => r.data),
  saveSettings: (payload) => api.put('/admin/settings', payload),

  team: (options) => api.get('/admin/team', options).then((r) => r.data),
  createTeamMember: (payload) => api.post('/admin/team', payload),
  updateTeamMember: (id, payload) => api.patch(`/admin/team/${id}`, payload),
};
