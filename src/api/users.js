import api from './api';

/**
 * Получение списка пользователей с пагинацией
 * @param {Object} params - параметры запроса
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество записей на странице
 * @returns {Promise} Promise с результатом запроса
 */
export const getUsers = async (params = { page: 1, limit: 10 }) => {
  try {
    const response = await api.get('/users', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Получение данных пользователя по ID
 * @param {string} userId - ID пользователя
 * @returns {Promise} Promise с результатом запроса
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Обновление данных пользователя
 * @param {string} userId - ID пользователя
 * @param {Object} userData - обновленные данные пользователя
 * @returns {Promise} Promise с результатом запроса
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Удаление пользователя
 * @param {string} userId - ID пользователя
 * @returns {Promise} Promise с результатом запроса
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Обновление пароля пользователя
 * @param {string} userId - ID пользователя
 * @param {Object} passwordData - данные для смены пароля
 * @param {string} passwordData.currentPassword - текущий пароль
 * @param {string} passwordData.newPassword - новый пароль
 * @returns {Promise} Promise с результатом запроса
 */
export const updatePassword = async (userId, passwordData) => {
  try {
    const response = await api.put(`/users/${userId}/password`, passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}; 