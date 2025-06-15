import axios from 'axios';

const API = axios.create({
  baseURL: '/api/faculty' // No hardcoded localhost
});

export const getFacultyPage = async (page = 1) => {
  const res = await API.get(`/all?page=${page}`);
  return res.data;
};
