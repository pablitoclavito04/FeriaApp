import api from './api';

const getCasetas = async () => {
  const response = await api.get('/casetas');
  return response.data;
};

const getCaseta = async (id) => {
  const response = await api.get(`/casetas/${id}`);
  return response.data;
};

const createCaseta = async (casetaData) => {
  const response = await api.post('/casetas', casetaData);
  return response.data;
};

const updateCaseta = async (id, casetaData) => {
  const response = await api.put(`/casetas/${id}`, casetaData);
  return response.data;
};

const deleteCaseta = async (id) => {
  const response = await api.delete(`/casetas/${id}`);
  return response.data;
};

export default { getCasetas, getCaseta, createCaseta, updateCaseta, deleteCaseta };