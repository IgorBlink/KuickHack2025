import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Защищенный маршрут, который перенаправляет неавторизованных пользователей на страницу входа
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Показываем заглушку пока проверяем аутентификацию
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--color-background)'
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          borderTop: '3px solid var(--color-primary)',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Если пользователь авторизован, показываем защищенный контент
  return children;
};

export default ProtectedRoute; 