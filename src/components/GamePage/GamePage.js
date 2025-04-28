import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GamePage.css';
import logo from '../../assets/logo.png';

const GamePage = () => {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [gameInfo, setGameInfo] = useState({
    title: 'Тема',
    players: 0,
    maxPlayers: 1000,
  });
  const [settings, setSettings] = useState({
    readAloud: false,
    memes: true,
    soundEffects: true
  });

  // В реальном приложении здесь будет API-запрос для получения информации об игре
  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      setGameInfo({
        title: 'Тема',
        players: 386,
        maxPlayers: 798,
      });
      
      // Генерируем случайное имя при первой загрузке
      if (!playerName) {
        generateRandomName();
      }
    }, 1000);
  }, [gameCode, playerName]);

  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  const toggleSetting = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Генерация случайного имени
  const generateRandomName = () => {
    const names = [
      'Артём', 'Александр', 'Максим', 'Дмитрий', 'Иван',
      'Кирилл', 'Никита', 'Михаил', 'Егор', 'Матвей',
      'Андрей', 'Илья', 'Алексей', 'Роман', 'Сергей',
      'Мария', 'Анна', 'Софья', 'Алиса', 'Виктория',
      'Анастасия', 'Полина', 'Екатерина', 'Варвара', 'Дарья'
    ];
    
    const adjectives = [
      'Умный', 'Быстрый', 'Крутой', 'Весёлый', 'Смелый',
      'Яркий', 'Красивый', 'Сильный', 'Добрый', 'Ловкий'
    ];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    setPlayerName(`${randomAdjective} ${randomName}`);
  };

  const handleJoinGame = (e) => {
    e.preventDefault();
    
    if (playerName.trim()) {
      // В реальном приложении здесь будет API-запрос на присоединение к игре
      navigate(`/play/${gameCode}`, { state: { playerName, settings } });
    }
  };

  // Обработчик кнопки обновления имени
  const handleRefreshName = (e) => {
    e.preventDefault();
    generateRandomName();
  };

  return (
    <div className="game">
      <div className="game__stars"></div>
      <div className="game__stars-2"></div>
      <div className="game__stars-3"></div>

      <div className="game__header">
        <div className="game__theme">
          <img src={logo} alt="Logo" className="game__logo" />
          {gameInfo.title}
        </div>
        <div className="game__counter">
          {gameInfo.players} <span className="game__counter-separator">/</span> {gameInfo.maxPlayers}
        </div>
        <div className="game__code-box">
          <div className="game__code-label">Game Code</div>
          <div className="game__code-value">{gameCode}</div>
        </div>
      </div>

      <div className="game__content">
        <div className="game__form-container">
          <div className="game__title">Ваше имя викторины...</div>
          
          <form onSubmit={handleJoinGame} className="game__form">
            <div className="game__input-wrapper">
              <input
                type="text"
                className="game__input"
                placeholder="Введите ваше имя"
                value={playerName}
                onChange={handleNameChange}
                autoFocus
              />
              <button 
                className="game__refresh-button" 
                type="button" 
                onClick={handleRefreshName}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                </svg>
              </button>
            </div>
            
            <button 
              type="submit" 
              className="game__start-button"
              disabled={!playerName.trim()}
            >
              Начинать
            </button>
          </form>
          
          <div className="game__settings">
            <div className="game__settings-title">Настройки</div>
            
            <div className="game__setting-item">
              <div className="game__setting-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6v12M6 12h12"/>
                </svg>
              </div>
              <div className="game__setting-label">Читать текст вслух</div>
              <label className="game__toggle">
                <input 
                  type="checkbox" 
                  checked={settings.readAloud}
                  onChange={() => toggleSetting('readAloud')}
                />
                <span className="game__toggle-slider"></span>
              </label>
            </div>
            
            <div className="game__setting-item">
              <div className="game__setting-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v.01M12 8v4"/>
                </svg>
              </div>
              <div className="game__setting-label">Мемы</div>
              <label className="game__toggle">
                <input 
                  type="checkbox" 
                  checked={settings.memes}
                  onChange={() => toggleSetting('memes')}
                />
                <span className="game__toggle-slider"></span>
              </label>
            </div>
            
            <div className="game__setting-item">
              <div className="game__setting-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                </svg>
              </div>
              <div className="game__setting-label">Звуковые эффекты</div>
              <label className="game__toggle">
                <input 
                  type="checkbox" 
                  checked={settings.soundEffects}
                  onChange={() => toggleSetting('soundEffects')}
                />
                <span className="game__toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage; 