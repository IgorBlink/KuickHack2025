import api from './api';

/**
 * API-методы для работы с квизами
 */
const quizzesAPI = {
  /**
   * Получение всех квизов с пагинацией
   * @param {Object} params - параметры запроса
   * @param {number} params.page - номер страницы
   * @param {number} params.limit - количество записей на странице
   * @param {string} params.category - категория квизов
   * @returns {Promise} Promise с результатом запроса
   */
  getQuizzes: async (params = { page: 1, limit: 10 }) => {
    try {
      const response = await api.get('/quizzes', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Получение квиза по ID
   * @param {string} quizId - ID квиза
   * @returns {Promise} Promise с результатом запроса
   */
  getQuizById: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Создание нового квиза
   * @param {Object} quizData - данные квиза
   * @returns {Promise} Promise с результатом запроса
   */
  createQuiz: async (quizData) => {
    try {
      const response = await api.post('/quizzes', quizData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Обновление квиза
   * @param {string} quizId - ID квиза
   * @param {Object} quizData - обновленные данные квиза
   * @returns {Promise} Promise с результатом запроса
   */
  updateQuiz: async (quizId, quizData) => {
    try {
      const response = await api.put(`/quizzes/${quizId}`, quizData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Удаление квиза
   * @param {string} quizId - ID квиза
   * @returns {Promise} Promise с результатом запроса
   */
  deleteQuiz: async (quizId) => {
    try {
      const response = await api.delete(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Получение популярных квизов
   * @param {number} limit - количество записей
   * @returns {Promise} Promise с результатом запроса
   */
  getTrendingQuizzes: async (limit = 10) => {
    try {
      const response = await api.get('/quizzes/trending', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Получение категорий квизов
   * @returns {Promise} Promise с результатом запроса
   */
  getCategories: async () => {
    try {
      const response = await api.get('/quizzes/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default quizzesAPI; 