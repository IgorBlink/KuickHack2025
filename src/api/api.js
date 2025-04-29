import axios from 'axios';

// Обновление базового URL, включая порт 6000
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:6000/api',
  headers: {
    'Content-Type': 'application/json',
    'Ngrok-Skip-Browser-Warning': 'true'
  },
});

// Интерцептор для добавления токена авторизации к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка ошибки авторизации (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api; 