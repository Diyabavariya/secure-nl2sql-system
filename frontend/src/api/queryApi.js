import axios from 'axios';

const TOKEN_KEY = 'qs_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function submitQuery(question) {
  const response = await api.post('/query/', { question });
  return response.data;
}

export async function getRoleCatalog() {
  const response = await api.get('/meta/roles');
  return response.data;
}

