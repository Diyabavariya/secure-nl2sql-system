import axios from 'axios';

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export async function registerUser(email, password, role) {
  const response = await authApi.post('/auth/register', { email, password, role });
  return response.data;
}

export async function loginUser(email, password) {
  const response = await authApi.post('/auth/login', { email, password });
  return response.data;
}

export async function getMe(token) {
  const response = await authApi.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

