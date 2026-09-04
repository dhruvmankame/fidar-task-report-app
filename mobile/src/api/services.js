import api from './client';

// Thin wrappers around each REST endpoint. Screens call these instead of
// touching axios directly, which keeps API paths in one place.

export const AuthAPI = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }).then((r) => r.data),
  register: (payload) => api.post('/api/auth/register', payload).then((r) => r.data),
  me: () => api.get('/api/auth/me').then((r) => r.data),
};

export const TaskAPI = {
  list: (params) => api.get('/api/tasks', { params }).then((r) => r.data),
  get: (id) => api.get(`/api/tasks/${id}`).then((r) => r.data),
  create: (payload) => api.post('/api/tasks', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/tasks/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/api/tasks/${id}`).then((r) => r.data),
  addComment: (id, text, isUpdate = false) =>
    api.post(`/api/tasks/${id}/comments`, { text, isUpdate }).then((r) => r.data),
  addAttachment: (id, name, dataUrl) =>
    api.post(`/api/tasks/${id}/attachments`, { name, dataUrl }).then((r) => r.data),
  removeAttachment: (id, attId) =>
    api.delete(`/api/tasks/${id}/attachments/${attId}`).then((r) => r.data),
};

export const UserAPI = {
  list: () => api.get('/api/users').then((r) => r.data),
};

export const ReportAPI = {
  summary: () => api.get('/api/reports/summary').then((r) => r.data),
  monthly: (year, month) =>
    api.get('/api/reports/monthly', { params: { year, month } }).then((r) => r.data),
  employees: (year, month) =>
    api.get('/api/reports/employees', { params: { year, month } }).then((r) => r.data),
  activity: (limit) =>
    api.get('/api/reports/activity', { params: { limit } }).then((r) => r.data),
};
