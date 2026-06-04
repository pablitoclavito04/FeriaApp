import api from './api';

// Admin-only user management. The token is attached automatically by the api
// interceptor; the backend enforces the admin role.

const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

const updateUserRole = async (id, role) => {
  const response = await api.put(`/users/${id}/role`, { role });
  return response.data;
};

const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export default { getUsers, updateUserRole, deleteUser };
