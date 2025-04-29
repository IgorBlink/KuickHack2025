import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './AuthPage.css';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';

const AuthPage = () => {
  const location = useLocation();
  // Получаем параметр redirectTo из location.state, если он есть
  const redirectTo = location.state?.redirectTo || '/';
  // Получаем параметр isLogin из location.state, если он есть (по умолчанию true)
  const initialIsLogin = location.state?.isLogin !== false;
  
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();

  // Если пользователь уже аутентифицирован, перенаправляем на нужную страницу
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    // Базовая валидация
    if (!username || !password) {
      setError('Все поля должны быть заполнены');
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    
    // Валидация пароля (минимум 6 символов)
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      let result;
      
      if (isLogin) {
        // Логин
        result = await login(username, password);
      } else {
        // Регистрация
        result = await register(username, password);
      }
      
      if (result.success) {
        setSuccess(isLogin ? 'Вход выполнен успешно!' : 'Регистрация прошла успешно!');
        // После успешной авторизации перенаправляем на указанную страницу
        setTimeout(() => {
          navigate(redirectTo);
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Произошла непредвиденная ошибка. Пожалуйста, попробуйте позже.');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__stars"></div>
      <div className="auth__stars-2"></div>
      <div className="auth__stars-3"></div>

      <div className="auth__content">
        <div className="auth__logo">
          <Link to="/">
            <img src={logo} alt="BlinkQuiz" />
          </Link>
        </div>
        
        <div className="auth__form-container">
          <div className="auth__tabs">
            <button 
              className={`auth__tab ${isLogin ? 'auth__tab--active' : ''}`}
              onClick={() => setIsLogin(true)}
              disabled={loading}
            >
              Вход
            </button>
            <button 
              className={`auth__tab ${!isLogin ? 'auth__tab--active' : ''}`}
              onClick={() => setIsLogin(false)}
              disabled={loading}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth__form">
            <h2 className="auth__title">{isLogin ? 'Добро пожаловать!' : 'Создайте аккаунт'}</h2>
            
            {error && <div className="auth__error">{error}</div>}
            {success && <div className="auth__success">{success}</div>}
            
            <div className="auth__field">
              <label htmlFor="username" className="auth__label">Имя пользователя</label>
              <input
                id="username"
                type="text"
                className="auth__input"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                disabled={loading}
              />
            </div>
            
            <div className="auth__field">
              <label htmlFor="password" className="auth__label">Пароль</label>
              <input
                id="password"
                type="password"
                className="auth__input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            
            {!isLogin && (
              <div className="auth__field">
                <label htmlFor="confirm-password" className="auth__label">Подтвердите пароль</label>
                <input
                  id="confirm-password"
                  type="password"
                  className="auth__input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
            
            {isLogin && (
              <div className="auth__forgot">
                <button type="button" className="auth__link" disabled={loading}>Забыли пароль?</button>
              </div>
            )}
            
            <button 
              type="submit" 
              className={`auth__button ${loading ? 'auth__button--loading' : ''}`}
              disabled={loading}
            >
              {loading 
                ? 'Обработка...' 
                : isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>
          
          <div className="auth__footer">
            {isLogin ? (
              <p>Еще нет аккаунта? <button onClick={toggleForm} className="auth__text-button" disabled={loading}>Зарегистрируйтесь</button></p>
            ) : (
              <p>Уже есть аккаунт? <button onClick={toggleForm} className="auth__text-button" disabled={loading}>Войдите</button></p>
            )}
          </div>
        </div>
        
        <div className="auth__additional-links">
          <Link to="/" className="auth__link">На главную</Link>
          <span className="auth__separator">•</span>
          <Link to="/join" className="auth__link">Присоединиться к игре</Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 