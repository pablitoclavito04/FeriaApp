import api from './api';

const getConcerts = async () => {
  const response = await api.get('/concerts');
  return response.data;
};

const getConcertsByCaseta = async (casetaId) => {
  const response = await api.get(`/concerts/caseta/${casetaId}`);
  return response.data;
};

const createConcert = async (concertData) => {
  const response = await api.post('/concerts', concertData);
  return response.data;
};

const updateConcert = async (id, concertData) => {
  const response = await api.put(`/concerts/${id}`, concertData);
  return response.data;
};

const deleteConcert = async (id) => {
  const response = await api.delete(`/concerts/${id}`);
  return response.data;
};

export default { getConcerts, getConcertsByCaseta, createConcert, updateConcert, deleteConcert };