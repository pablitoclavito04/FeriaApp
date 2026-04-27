import api from './api';

const getMenus = async (params = {}) => {
  const response = await api.get('/menus', { params });
  return response.data;
};

const getMenusByCaseta = async (casetaId) => {
  const response = await api.get(`/menus/caseta/${casetaId}`);
  return response.data;
};

const createMenu = async (menuData) => {
  const response = await api.post('/menus', menuData);
  return response.data;
};

const createMenusBulk = async (caseta, items) => {
  const response = await api.post('/menus/bulk', { caseta, items });
  return response.data;
};

const updateMenu = async (id, menuData) => {
  const response = await api.put(`/menus/${id}`, menuData);
  return response.data;
};

const deleteMenu = async (id) => {
  const response = await api.delete(`/menus/${id}`);
  return response.data;
};

export default { getMenus, getMenusByCaseta, createMenu, createMenusBulk, updateMenu, deleteMenu };