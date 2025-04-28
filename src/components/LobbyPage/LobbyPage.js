import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './LobbyPage.css';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
// eslint-disable-next-line no-unused-vars
import { FaCopy, FaUsers, FaCheck, FaPlay, FaTwitter, FaFacebook, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import logo from '../../assets/logo.png';

const LobbyPage = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  // eslint-disable-next-line no-unused-vars
  const { currentUser } = useAuth();
  const [sessionCode, setSessionCode] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [autoStart, setAutoStart] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdownText, setCountdownText] = useState('');
  const [countdownVisible, setCountdownVisible] = useState(false);
  const countdownTimer = useRef(null);
  const autoStartThreshold = 5; // Автозапуск при 5 участниках

  // Генерация случайного кода сессии
  useEffect(() => {
    generateRandomCode();
  }, []);

  // Симуляция подключения участников
  useEffect(() => {
    const interval = setInterval(() => {
      if (participants.length < 12 && Math.random() > 0.7) {
        addParticipant();
      }
    }, 3000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants]);

  // Автозапуск при достижении порога участников
  useEffect(() => {
    if (autoStart && participants.length >= autoStartThreshold && !countdown) {
      handleStartQuiz();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, participants]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const generateRandomCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSessionCode(code);
  };

  const addParticipant = () => {
    const names = [
      'Саша', 'Маша', 'Петя', 'Вася', 'Оля', 'Коля', 'Даша', 'Паша', 
      'Катя', 'Женя', 'Лена', 'Дима', 'Аня', 'Юля', 'Артем', 'Настя'
    ];
    
    const avatarColors = [
      '#FF6B6B', '#4ECDC4', '#FFD166', '#6A0572', '#5D5AFF', 
      '#8A4FFF', '#FF928B', '#01BAEF', '#7A918D', '#F3C623'
    ];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    
    const newParticipant = {
      id: Date.now(),
      name: randomName,
      avatarColor: randomColor,
      joined: new Date()
    };
    
    setParticipants([...participants, newParticipant]);
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
          
          <div className="lobby__waiting">
            <div className="lobby__waiting-icon"></div>
            <div className="lobby__waiting-text">Ждем участников...</div>
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
    </div>
  );
};

export default LobbyPage; 