import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './JoinPage.css';
import logo from '../../assets/logo.png';

const JoinPage = () => {
  const [gameCode, setGameCode] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setGameCode(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameCode.trim()) {
      // Перенаправляем на страницу ввода имени и начала игры
      navigate(`/game/${gameCode}`);
    }
  };

  return (
    <div className="join">
      <div className="join__stars"></div>
      <div className="join__stars-2"></div>
      <div className="join__stars-3"></div>

      <div className="join__content">
        <div className="join__main-logo">
          <img src={logo} alt="BlinkQuiz" />
        </div>
        
        <div className="join__form-container">
          <form onSubmit={handleSubmit} className="join__form">
            <input
              type="text"
              className="join__input"
              placeholder="Введите код присоединения"
              value={gameCode}
              onChange={handleInputChange}
              aria-label="Код присоединения к викторине"
              autoFocus
            />
            <button 
              type="submit" 
              className="join__button join__button--large"
              disabled={!gameCode}
            >
              Присоединиться
            </button>
          </form>
        </div>
        
        <div className="join__additional-links">
          <p>Нет кода? <Link to="/" className="join__link">Вернуться на главную</Link> или <Link to="/auth" className="join__link">войти в аккаунт</Link></p>
        </div>
      </div>
    </div>
  );
};

export default JoinPage; 