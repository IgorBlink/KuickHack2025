import React, { createContext, useContext, useState, useEffect } from 'react';
import authAPI from '../api/auth';

// Создаем контекст
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверка аутентификации при загрузке
  useEffect(() => {
    const checkAuth = () => {
      const token = authAPI.getToken();
      if (token) {
        // Можно добавить проверку валидности токена
        // через запрос к API если бэкенд поддерживает
        setIsAuthenticated(true);
        // Здесь можно добавить запрос для получения данных пользователя
        // Пока просто установим заглушку
        setUser({ username: 'Пользователь' });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Метод для входа пользователя
  const login = async (username, password) => {
    try {
      const data = await authAPI.login(username, password);
      if (data.success) {
        setIsAuthenticated(true);
        // Здесь можно добавить запрос для получения данных пользователя
        setUser({ username });
        return { success: true };
      }
      return { success: false, message: data.message || 'Ошибка авторизации' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Произошла ошибка при авторизации' 
      };
    }
  };

  // Метод для регистрации пользователя
  const register = async (username, password) => {
    try {
      const data = await authAPI.register(username, password);
      if (data.success) {
        setIsAuthenticated(true);
        setUser({ username });
        return { success: true };
      }
      return { success: false, message: data.message || 'Ошибка регистрации' };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Произошла ошибка при регистрации' 
      };
    }
  };

  // Метод для выхода пользователя
  const logout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Значения, которые будут доступны через контекст
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Создаем хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

export default AuthContext; 