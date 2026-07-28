import api from './api';

export const getTasks = async ({ search, priority, status } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (priority) params.priority = priority;
  if (status) params.status = status;

  const { data } = await api.get('/tasks', { params });
  return data.data.tasks;
};

export const createTask = async (payload) => {
  const { data } = await api.post('/tasks', payload);
  return data.data.task;
};

export const updateTask = async (id, payload) => {
  const { data } = await api.patch(`/tasks/${id}`, payload);
  return data.data.task;
};

export const updateTaskStatus = async (id, status) => {
  const { data } = await api.patch(`/tasks/${id}/status`, { status });
  return data.data.task;
};

export const deleteTask = async (id) => {
  await api.delete(`/tasks/${id}`);
  return id;
};
