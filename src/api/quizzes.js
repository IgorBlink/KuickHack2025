import api from './api';
import cacheManager from './cacheManager';

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
  getQuizzes: async () => {
    return cacheManager.get('all_quizzes', async () => {
      console.log('[API] Fetching all quizzes');
      const response = await api.get('/quiz');
      return response.data;
    });
  },

  /**
   * Получение квиза по ID
   * @param {string} quizId - ID квиза
   * @returns {Promise} Promise с результатом запроса
   */
  getQuizById: async (quizId) => {
    return cacheManager.get(`quiz_${quizId}`, async () => {
      console.log(`[API] Fetching quiz: ${quizId}`);
      const response = await api.get(`/quiz/${quizId}`);
      return response.data;
    });
  },

  /**
   * Создание нового квиза
   * @param {Object} quizData - данные квиза
   * @returns {Promise} Promise с результатом запроса
   */
  createQuiz: async (quizData) => {
    try {
      const response = await api.post('/quiz', quizData);
      // Очищаем кэш списка квизов при создании нового
      cacheManager.clear('all_quizzes');
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
      const response = await api.put(`/quiz/${quizId}`, quizData);
      // Очищаем кэш при обновлении
      cacheManager.clear(`quiz_${quizId}`);
      cacheManager.clear('all_quizzes');
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
      const response = await api.delete(`/quiz/${quizId}`);
      // Очищаем кэш при удалении
      cacheManager.clear(`quiz_${quizId}`);
      cacheManager.clear('all_quizzes');
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
  },

  /**
   * Создание лобби для квиза
   * @param {Object} quizData - данные квиза
   * @returns {Promise} Promise с результатом запроса
   */
  createLobby: async (quizData) => {
    try {
      const response = await api.post('/lobby', {
        quizId: quizData.quizId,
        baseReward: quizData.baseReward || 300, 
        withReward: quizData.withReward !== undefined ? quizData.withReward : true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Присоединение к лобби по коду
   * @param {string} lobbyCode - код лобби
   * @param {Object} playerData - данные игрока
   * @returns {Promise} Promise с результатом запроса
   */
  joinLobby: async (lobbyCode, playerData) => {
    try {
      const response = await api.post(`/lobby/${lobbyCode}/join`, {
        nickname: playerData.nickname,
        walletAddress: playerData.walletAddress || ''
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default quizzesAPI; 