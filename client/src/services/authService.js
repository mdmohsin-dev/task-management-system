import api from './api';

export const signup = async ({ name, email, password }) => {
  const { data } = await api.post('/auth/signup', { name, email, password });
  return data.data; // { user, token }
};

export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data; // { user, token }
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data.data.user;
};
