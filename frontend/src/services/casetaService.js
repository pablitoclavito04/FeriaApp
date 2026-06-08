import api from './api';

const getCasetas = async (params = {}) => {
  const response = await api.get('/casetas', { params });
  return response.data;
};

const getCaseta = async (id) => {
  const response = await api.get(`/casetas/${id}`);
  return response.data;
};

const createCaseta = async (casetaData) => {
  const response = await api.post('/casetas', casetaData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const updateCaseta = async (id, casetaData) => {
  const response = await api.put(`/casetas/${id}`, casetaData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const deleteCaseta = async (id) => {
  const response = await api.delete(`/casetas/${id}`);
  return response.data;
};

// Delete every caseta (optionally scoped to a fair). Returns { deleted }.
const deleteAllCasetas = async (params = {}) => {
  const response = await api.delete('/casetas', { params });
  return response.data;
};

// Upload a fair map and run AI detection on it. Returns
// { mapUrl, bounds, imageSize, expectedCount, casetas }.
// AI detection on a full map takes well over a minute, so override axios's
// default timeout (220s) to match the backend/nginx limits and avoid the
// client aborting a request that is still being processed.
const detectFromMap = async (formData) => {
  const response = await api.post('/casetas/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 220000,
  });
  return response.data;
};

// Bulk create/update casetas (e.g. after reviewing map detection).
// payload: { fair, mapImage, mapBounds, casetas: [{ number, location }] }.
const bulkCreateCasetas = async (payload) => {
  const response = await api.post('/casetas/bulk', payload);
  return response.data;
};

export default {
  getCasetas,
  getCaseta,
  createCaseta,
  updateCaseta,
  deleteCaseta,
  deleteAllCasetas,
  detectFromMap,
  bulkCreateCasetas,
};