import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Защищенный маршрут, который перенаправляет неавторизованных пользователей 
 * на страницу входа с параметром для обратного перенаправления
 */
const ProtectedRouteWithRedirect = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

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
  // с сохранением текущего URL для возврата после авторизации
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ redirectTo: location.pathname }} replace />;
  }

  // Если пользователь авторизован, показываем защищенный контент
  return children;
};

export default ProtectedRouteWithRedirect; 