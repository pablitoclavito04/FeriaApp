import api from './api';

const getFairs = async () => {
  const response = await api.get('/fairs');
  return response.data;
};

const getFair = async (id) => {
  const response = await api.get(`/fairs/${id}`);
  return response.data;
};

const createFair = async (fairData) => {
  const response = await api.post('/fairs', fairData);
  return response.data;
};

const updateFair = async (id, fairData) => {
  const response = await api.put(`/fairs/${id}`, fairData);
  return response.data;
};

const deleteFair = async (id) => {
  const response = await api.delete(`/fairs/${id}`);
  return response.data;
};

export default { getFairs, getFair, createFair, updateFair, deleteFair };