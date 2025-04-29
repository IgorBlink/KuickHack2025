import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './LobbyPage.css';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
// eslint-disable-next-line no-unused-vars
import { FaCopy, FaUsers, FaCheck, FaPlay, FaTwitter, FaFacebook, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import logo from '../../assets/logo.png';

const LobbyPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { currentUser } = useAuth();
  const [sessionCode, setSessionCode] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [autoStart, setAutoStart] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdownText, setCountdownText] = useState('');
  const [countdownVisible, setCountdownVisible] = useState(false);
  const countdownTimer = useRef(null);
  const autoStartThreshold = 4; // Изменено: автозапуск при 4 участниках (макс. кол-во)
  
  // Получаем данные из навигации
  const playerName = location.state?.playerName || 'Гость';
  const isHost = location.state?.isHost || false;
  const soundEnabled = location.state?.soundEnabled || true;
  const memesEnabled = location.state?.memesEnabled || true;
  const voiceoverEnabled = location.state?.voiceoverEnabled || false;
  
  const [isReady, setIsReady] = useState(false);
  const [players, setPlayers] = useState([
    { id: 1, name: playerName, ready: false, isCurrentPlayer: true, avatarColor: '#ffab2e' }
  ]);
  
  // Массив имен для случайных игроков
  const randomNames = [
    'Саша', 'Маша', 'Петя', 'Вася', 'Оля', 'Коля', 'Даша', 'Паша', 
    'Катя', 'Женя', 'Лена', 'Дима', 'Аня', 'Юля', 'Артем', 'Настя'
  ];
  
  // Массив цветов для аватаров
  const avatarColors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#6A0572', '#5D5AFF', 
    '#8A4FFF', '#FF928B', '#01BAEF', '#7A918D', '#F3C623'
  ];

  // Генерация случайного кода сессии
  useEffect(() => {
    generateRandomCode();
  }, []);

  // Симуляция подключения участников с задержкой (не больше 4)
  useEffect(() => {
    if (players.length < 4) {
      const interval = setInterval(() => {
        if (Math.random() > 0.5) {
          addRandomPlayer();
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [players.length]);

  // Автозапуск при достижении порога участников
  useEffect(() => {
    if (autoStart && players.length >= autoStartThreshold && !countdown) {
      handleStartQuiz();
    }
  }, [autoStart, players.length, countdown]);

  // Обратный отсчет
  useEffect(() => {
    if (countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(countdown - 1);
          
          // Анимация для обратного отсчета
          if (countdown <= 3) {
            setCountdownText(countdown);
            setCountdownVisible(true);
            setShowOverlay(true);
            
            // Скрываем текущую цифру через 0.8 секунды
            setTimeout(() => {
              setCountdownVisible(false);
            }, 800);
          }
        }, 1000);
        countdownTimer.current = timer;
        return () => clearTimeout(timer);
      } else {
        // Показываем "GO!" и начинаем квиз
        setCountdownText("GO!");
        setCountdownVisible(true);
        
        // Запуск квиза после задержки
        setTimeout(() => {
          startQuiz();
        }, 1000);
      }
    }
  }, [countdown]);

  const generateRandomCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSessionCode(code);
  };

  // Функция для добавления случайного игрока
  const addRandomPlayer = () => {
    // Проверяем, что у нас не больше 4 игроков
    if (players.length >= 4) return;
    
    // Выбираем случайное имя, которого еще нет в игре
    let randomName;
    do {
      randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    } while (players.find(player => player.name === randomName));
    
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    
    const newPlayer = {
      id: Date.now(),
      name: randomName,
      avatarColor: randomColor,
      ready: Math.random() > 0.5,
      isCurrentPlayer: false
    };
    
    setPlayers(prev => [...prev, newPlayer]);
    
    // Показываем уведомление о присоединении игрока
    showPlayerJoinedNotification(randomName);
  };

  // Функция для отображения уведомления о присоединении игрока
  const showPlayerJoinedNotification = (playerName) => {
    // Можно реализовать красивое всплывающее уведомление
    console.log(`Игрок ${playerName} присоединился к лобби!`);
    
    // Пример: добавить временный элемент уведомления на страницу
    const notification = document.createElement('div');
    notification.className = 'lobby__notification';
    notification.textContent = `Игрок ${playerName} присоединился к лобби!`;
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const handleStartQuiz = () => {
    // Начинаем обратный отсчет с 3 секунд
    setCountdown(3);
  };

  const toggleAutoStart = () => {
    setAutoStart(!autoStart);
  };

  const startQuiz = () => {
    // Перенаправляем на страницу квиза
    if (countdownTimer.current) clearTimeout(countdownTimer.current);
    navigate(`/play/${sessionCode}`);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    // Здесь можно добавить визуальную обратную связь
  };

  const copyUrl = () => {
    const url = `${window.location.origin}/join/${sessionCode}`;
    navigator.clipboard.writeText(url);
    // Здесь можно добавить визуальную обратную связь
  };

  const shareOnSocial = (platform) => {
    const url = `${window.location.origin}/join/${sessionCode}`;
    const text = `Присоединяйтесь к моему квизу! Код: ${sessionCode}`;
    let shareUrl;

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank');
  };

  // Обработка готовности игрока
  const handleReady = () => {
    setIsReady(!isReady);
    setPlayers(prev => 
      prev.map(player => 
        player.isCurrentPlayer ? { ...player, ready: !isReady } : player
      )
    );
  };

  // Обработка запуска игры (только для хоста)
  const handleStartGame = () => {
    // В реальной логике нужно отправить сигнал на сервер
    setCountdown(5);
    
    // Обратный отсчет перед началом игры
    const intervalId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          // Перенаправление на страницу игры
          navigate(`/play/${id}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Отображение для неадминов (игроков)
  const renderPlayerMode = () => (
    <div className="lobby__player-mode">
      <div className="lobby__waiting-message">
        Ожидание начала игры...
      </div>
      
      <div className="lobby__player-actions">
        <button 
          className={`lobby__ready-button ${isReady ? 'lobby__ready-button--active' : ''}`}
          onClick={handleReady}
        >
          {isReady ? 'Готов ✓' : 'Я готов!'}
        </button>
      </div>
      
      {countdown && (
        <div className="lobby__countdown">
          Игра начнется через {countdown}...
        </div>
      )}
    </div>
  );

  // Отображение для админа (хоста)
  const renderHostMode = () => (
    <div className="lobby__host-mode">
      <div className="lobby__host-controls">
        <button 
          className="lobby__start-button"
          onClick={handleStartGame}
          disabled={!players.every(player => player.ready)}
        >
          Начать игру
        </button>
      </div>
      
      {countdown && (
        <div className="lobby__countdown">
          Игра начнется через {countdown}...
        </div>
      )}
    </div>
  );

  return (
    <div className="lobby">
      {/* Фоновые элементы */}
      <div className="lobby__background">
        <div className="lobby__stars"></div>
        <div className="lobby__stars-2"></div>
        <div className="lobby__stars-3"></div>
      </div>

      {/* Хедер */}
      <div className="lobby__header">
        <div className="lobby__logo">
          <img src={logo} alt="KuickHack Quiz" className="lobby__logo-image" />
        </div>
        <div className="lobby__controls">
          <button 
            className="lobby__theme-button"
            onClick={toggleAutoStart}
          >
            Темы
          </button>
          <button 
            className="lobby__audio-button"
          >
            <span className="lobby__audio-icon"></span>
          </button>
          <button 
            className="lobby__fullscreen-button"
          >
            <span className="lobby__fullscreen-icon"></span>
          </button>
          <button 
            className="lobby__end-button"
          >
            Конец
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div className="lobby__main">
        <div className="lobby__container">
          <div className="lobby__join-info">
            <div className="lobby__step-container">
              <div className="lobby__step">
                <div className="lobby__step-number">1</div>
                <div className="lobby__step-text">
                  Присоединяйтесь с любого устройства
                </div>
              </div>
              
              <div className="lobby__url-container">
                <div className="lobby__url">
                  joinmyquiz.com
                </div>
                <button className="lobby__copy-button" onClick={copyUrl}>
                  <div className="lobby__copy-icon"></div>
                </button>
              </div>
            </div>
            
            <div className="lobby__step-container">
              <div className="lobby__step">
                <div className="lobby__step-number">2</div>
                <div className="lobby__step-text">
                  Введите код присоединения
                </div>
              </div>
              
              <div className="lobby__code-container">
                {sessionCode.split('').map((digit, index) => (
                  <div key={index} className="lobby__code-digit">{digit}</div>
                ))}
                <button className="lobby__copy-button" onClick={copyCode}>
                  <div className="lobby__copy-icon"></div>
                </button>
              </div>
            </div>

            <div className="lobby__qr-container">
              <div className="lobby__qr-code">
                <QRCodeSVG 
                  value={`${window.location.origin}/join/${sessionCode}`} 
                  size={150}
                  fgColor="#333"
                  bgColor="#fff"
                  level="H"
                />
              </div>
              <div className="lobby__qr-text">
                Share Via
              </div>
              
              <div className="lobby__start-container">
                <button 
                  onClick={handleStartQuiz}
                  className="lobby__start-button"
                >
                  НАЧАЛО
                </button>
              </div>
            </div>
          </div>
          
          {/* Обновленная секция ожидания участников */}
          <div className="lobby__waiting">
            <div className="lobby__waiting-icon"></div>
            <div className="lobby__waiting-text">Ждем участников...</div>
            {/* <div className="lobby__players-count">
              {players.length} из 4 участников в лобби
            </div> */}
            
            {/* Панель игроков */}
            <div className="lobby__players-panel">
              {players.map((player) => (
                <div key={player.id} 
                  className={`lobby__player-card ${player.ready ? 'lobby__player-card--ready' : ''} ${player.isCurrentPlayer ? 'lobby__player-card--current' : ''}`}
                >
                  <div className="lobby__player-avatar" style={{ backgroundColor: player.avatarColor }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="lobby__player-details">
                    <div className="lobby__player-name">
                      {player.name} {player.isCurrentPlayer && '(вы)'}
                    </div>
                    {/* <div className={`lobby__player-status ${player.ready ? 'lobby__player-status--ready' : ''}`}>
                      {player.ready ? 'Готов' : 'Не готов'}
                    </div> */}
                  </div>
                </div>
              ))}
              
              {/* Добавляем пустые слоты для игроков */}
              {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, index) => (
                <div key={`empty-${index}`} className="lobby__player-card lobby__player-card--empty">
                  <div className="lobby__player-avatar lobby__player-avatar--empty">
                    ?
                  </div>
                  <div className="lobby__player-details">
                    <div className="lobby__player-name lobby__player-name--empty">
                      Ожидание игрока...
                    </div>
                    <div className="lobby__player-status">
                      Не подключен
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Оверлей с обратным отсчетом */}
      {showOverlay && (
        <div className="lobby__overlay">
          <div className="lobby__countdown">
            {countdownVisible && (
              <div className={`lobby__countdown-text ${countdownText === 'GO!' ? 'lobby__countdown-text--go' : ''}`}>
                {countdownText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Стили для уведомлений */}
      <style jsx="true">{`
        .lobby__notification {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(131, 56, 236, 0.9);
          color: white;
          padding: 12px 20px;
          border-radius: 50px;
          z-index: 1000;
          animation: slideUp 0.3s ease-out, fadeOut 0.5s ease-out 2.5s forwards;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LobbyPage; 