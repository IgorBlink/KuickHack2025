// Менеджер кэширования для API-запросов
const cacheManager = {
  // Хранилище кэша с ключами запросов
  cache: new Map(),
  
  // Флаги для отслеживания активных запросов
  pendingRequests: new Map(),
  
  // Получение данных из кэша или выполнение нового запроса
  async get(key, fetchFunction, ttl = 5 * 60 * 1000) {
    // Если запрос с таким ключом уже выполняется, ждем его завершения
    if (this.pendingRequests.has(key)) {
      return await this.pendingRequests.get(key);
    }
    
    // Проверяем кэш
    const cachedItem = this.cache.get(key);
    const now = Date.now();
    
    // Возвращаем кэшированные данные, если они не устарели
    if (cachedItem && now < cachedItem.expiry) {
      console.log(`[Cache] Using cached data for: ${key}`);
      return cachedItem.data;
    }
    
    // Создаем новый Promise для запроса
    const requestPromise = fetchFunction().then(data => {
      // Сохраняем результат в кэш
      this.cache.set(key, {
        data,
        expiry: now + ttl
      });
      
      // Удаляем флаг активного запроса
      this.pendingRequests.delete(key);
      
      return data;
    }).catch(error => {
      // Удаляем флаг активного запроса в случае ошибки
      this.pendingRequests.delete(key);
      throw error;
    });
    
    // Устанавливаем флаг активного запроса
    this.pendingRequests.set(key, requestPromise);
    
    // Выполняем запрос
    return requestPromise;
  },
  
  // Очистка всего кэша
  clearAll() {
    this.cache.clear();
  },
  
  // Очистка конкретного ключа
  clear(key) {
    this.cache.delete(key);
  }
};

export default cacheManager; 