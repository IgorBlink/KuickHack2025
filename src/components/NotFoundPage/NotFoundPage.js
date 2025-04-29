import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';
import logo from '../../assets/logo.png';

const NotFoundPage = () => {
  return (
    <div className="not-found">
      <div className="not-found__stars-container">
        <div className="not-found__stars not-found__stars--small"></div>
        <div className="not-found__stars not-found__stars--medium"></div>
        <div className="not-found__stars not-found__stars--large"></div>
      </div>
      
      <div className="not-found__content">
        <div className="not-found__logo-container">
          <img src={logo} alt="Logo" className="not-found__logo" />
        </div>
        
        <h1 className="not-found__title">404</h1>
        <h2 className="not-found__subtitle">Страница не найдена</h2>
        <p className="not-found__text">
          Кажется, вы попали в космическую аномалию. Запрашиваемая страница не существует.
        </p>
        
        <div className="not-found__buttons">
          <Link to="/" className="not-found__button not-found__button--primary">
            Вернуться на главную
          </Link>
          <Link to="/join" className="not-found__button not-found__button--secondary">
            Присоединиться к игре
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 