import api from './api';

/**
 * Методы для работы с аутентификацией
 */
const authAPI = {
  /**
   * Авторизация пользователя
   * @param {string} username - Имя пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise} Объект с данными пользователя и токеном
   */
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { 
        username, 
        password 
      });
      
      // Сохраняем токен и данные пользователя в localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user || {}));
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Ошибка входа в систему' };
    }
  },

  /**
   * Регистрация нового пользователя
   * @param {string} username - Имя пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise} Объект с данными созданного пользователя
   */
  register: async (username, password) => {
    try {
      const response = await api.post('/auth/register', { 
        username, 
        password 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Ошибка регистрации' };
    }
  },

  /**
   * Выход пользователя из системы
   * @returns {void}
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Можно добавить редирект на страницу логина
    // window.location.href = '/login';
  },

  /**
   * Получение токена пользователя из localStorage
   * @returns {string|null} Токен пользователя или null, если не авторизован
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Получение данных текущего пользователя
   * @returns {Object|null} Данные пользователя или null, если не авторизован
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  /**
   * Проверка, авторизован ли пользователь
   * @returns {boolean} true, если пользователь авторизован
   */
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  /**
   * Сброс пароля - запрос на отправку письма
   * @param {string} email - Email пользователя
   * @returns {Promise} Результат операции
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Установка нового пароля после сброса
   * @param {string} token - Токен для сброса пароля
   * @param {string} newPassword - Новый пароль
   * @returns {Promise} Результат операции
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default authAPI; 