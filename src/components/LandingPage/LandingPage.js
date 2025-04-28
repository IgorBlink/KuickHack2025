import React from 'react';
import './LandingPage.css';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    // Не нужно делать редирект, т.к. мы уже на главной странице
  };

  return (
    <div className="landing">
      <div className="landing__stars"></div>
      <div className="landing__stars-2"></div>
      <div className="landing__stars-3"></div>
      
      <header className="landing__header">
        <div className="landing__header-container">
          <div className="landing__logo">
            <img src={logo} alt="BlinkQuiz" />
          </div>
          <nav className="landing__nav">
            <ul className="landing__nav-list">
              <li className="landing__nav-item"><a href="#features" className="landing__nav-link">Возможности</a></li>
              <li className="landing__nav-item"><a href="#how-it-works" className="landing__nav-link">Как это работает</a></li>
              <li className="landing__nav-item"><a href="#token" className="landing__nav-link">Токены</a></li>
            </ul>
          </nav>
          {isAuthenticated ? (
            <div className="landing__auth-actions">
              <span className="landing__user-name">Привет, {user?.username || 'Пользователь'}</span>
              <button onClick={handleLogout} className="landing__button landing__button--outline">Выйти</button>
            </div>
          ) : (
            <Link to="/auth" className="landing__button landing__button--outline">Войти</Link>
          )}
        </div>
      </header>

      <section className="landing__hero">
        <div className="landing__container">
          <div className="landing__hero-content">
            <h1 className="landing__title">BlinkQuiz</h1>
            <p className="landing__subtitle">Интерактивные викторины с Web3 и AI на новом уровне</p>
            <p className="landing__description">
              Создавайте викторины, проводите соревнования и зарабатывайте токены за знания 
              на современной платформе с поддержкой ИИ и технологий блокчейн.
            </p>
            <div className="landing__cta">
              {isAuthenticated ? (
                <button className="landing__button landing__button--primary">Создать викторину</button>
              ) : (
                <Link to="/auth" className="landing__button landing__button--primary">Регистрация</Link>
              )}
              <Link to="/join" className="landing__button landing__button--secondary">Присоединиться к игре</Link>
            </div>
          </div>
          <div className="landing__hero-image">
            <svg 
              className="landing__quiz-svg" 
              width="400" 
              height="400" 
              viewBox="0 0 400 400" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Внешний круг */}
              <circle 
                cx="200" 
                cy="200" 
                r="180" 
                fill="none" 
                stroke="rgba(131, 56, 236, 0.3)" 
                strokeWidth="2"
              />
              
              {/* Средний круг с пульсацией */}
              <circle 
                cx="200" 
                cy="200" 
                r="140" 
                fill="none" 
                stroke="rgba(58, 134, 255, 0.5)" 
                strokeWidth="3"
                className="landing__pulse-circle"
              />
              
              {/* Внутренний круг - светится */}
              <circle 
                cx="200" 
                cy="200" 
                r="100" 
                fill="rgba(131, 56, 236, 0.1)" 
                stroke="rgba(131, 56, 236, 0.7)" 
                strokeWidth="2"
                filter="url(#glow)"
              />
              
              {/* Вращающиеся элементы вокруг */}
              <g className="landing__rotating-items">
                {/* Вопросительный знак вверху */}
                <g transform="translate(200, 60)">
                  <circle cx="0" cy="0" r="15" fill="#8338ec" />
                  <text x="0" y="7" fontSize="22" fill="white" textAnchor="middle">?</text>
                </g>
                
                {/* Вопросительный знак справа */}
                <g transform="translate(320, 200)">
                  <circle cx="0" cy="0" r="18" fill="#3a86ff" />
                  <text x="0" y="7" fontSize="24" fill="white" textAnchor="middle">?</text>
                </g>
                
                {/* Галочка внизу */}
                <g transform="translate(200, 340)">
                  <circle cx="0" cy="0" r="15" fill="#ff006e" />
                  <text x="0" y="7" fontSize="20" fill="white" textAnchor="middle">✓</text>
                </g>
                
                {/* X слева */}
                <g transform="translate(80, 200)">
                  <circle cx="0" cy="0" r="15" fill="#ff595e" />
                  <text x="0" y="7" fontSize="20" fill="white" textAnchor="middle">✗</text>
                </g>
                
                {/* Дополнительные элементы */}
                <g transform="translate(140, 100)">
                  <circle cx="0" cy="0" r="12" fill="#8338ec" opacity="0.8" />
                  <text x="0" y="5" fontSize="16" fill="white" textAnchor="middle">A</text>
                </g>
                
                <g transform="translate(280, 120)">
                  <circle cx="0" cy="0" r="12" fill="#3a86ff" opacity="0.8" />
                  <text x="0" y="5" fontSize="16" fill="white" textAnchor="middle">B</text>
                </g>
                
                <g transform="translate(300, 280)">
                  <circle cx="0" cy="0" r="12" fill="#ff006e" opacity="0.8" />
                  <text x="0" y="5" fontSize="16" fill="white" textAnchor="middle">C</text>
                </g>
                
                <g transform="translate(120, 300)">
                  <circle cx="0" cy="0" r="12" fill="#ff595e" opacity="0.8" />
                  <text x="0" y="5" fontSize="16" fill="white" textAnchor="middle">D</text>
                </g>
              </g>
              
              {/* Центральный элемент */}
              <g className="landing__central-element">
                <circle 
                  cx="200" 
                  cy="200" 
                  r="50" 
                  fill="url(#centralGradient)" 
                  filter="url(#glow)"
                />
                <text 
                  x="200" 
                  y="210" 
                  fontSize="40" 
                  fontWeight="bold" 
                  fill="white" 
                  textAnchor="middle"
                  filter="url(#glow)"
                >Q</text>
              </g>
              
              {/* Определения фильтров и градиентов */}
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                
                <linearGradient id="centralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8338ec" />
                  <stop offset="100%" stopColor="#3a86ff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>

      <section className="landing__features" id="features">
        <div className="landing__container">
          <h2 className="landing__section-title">Возможности платформы</h2>
          
          <div className="landing__features-grid">
            <div className="landing__feature-card">
              <div className="landing__feature-icon landing__feature-icon--ai"></div>
              <h3 className="landing__feature-title">AI-мастер квизов</h3>
              <p className="landing__feature-text">
                С помощью встроенного ИИ достаточно задать тему и формат — платформа автоматически сгенерирует цепочку вопросов, 
                предложит варианты ответов и уровни сложности.
              </p>
            </div>
            
            <div className="landing__feature-card">
              <div className="landing__feature-icon landing__feature-icon--token"></div>
              <h3 className="landing__feature-title">Токен-экономика</h3>
              <p className="landing__feature-text">
                Участники за верные ответы и победы в раундах получают собственные токены BlinkQuiz, которые можно обменять 
                на бонусы, доступ к эксклюзивным викторинам или NFT-бейджи.
              </p>
            </div>
            
            <div className="landing__feature-card">
              <div className="landing__feature-icon landing__feature-icon--nft"></div>
              <h3 className="landing__feature-title">NFT-бейджи и геймификация</h3>
              <p className="landing__feature-text">
                Победители и активные участники получают невзаимозаменяемые токены-бейджи, подтверждающие их достижения 
                и дающие доступ к закрытым турнирам и призам.
              </p>
            </div>
            
            <div className="landing__feature-card">
              <div className="landing__feature-icon landing__feature-icon--learning"></div>
              <h3 className="landing__feature-title">Работа над ошибками</h3>
              <p className="landing__feature-text">
                Автоматический разбор неверных ответов: ИИ объясняет, почему вы совершили ошибку, и предлагает 
                дополнительные тренировочные задания, чтобы прокачать слабые места.
              </p>
            </div>
            
            <div className="landing__feature-card">
              <div className="landing__feature-icon landing__feature-icon--blockchain"></div>
              <h3 className="landing__feature-title">Децентрализованная таблица лидеров</h3>
              <p className="landing__feature-text">
                Результаты участников хранятся в блокчейне, что гарантирует честность ранжирования и прозрачность 
                результатов — никто не сможет "подредактировать" очки.
              </p>
            </div>
            
            <div className="landing__feature-card">
              <div className="landing__feature-icon landing__feature-icon--social"></div>
              <h3 className="landing__feature-title">Социальное взаимодействие</h3>
              <p className="landing__feature-text">
                Игры проходят в режиме реального времени: участники присоединяются по коду, общаются в чате, 
                бросают вызов друзьям и соревнуются в специальных «Guild-баттлах».
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing__how-it-works" id="how-it-works">
        <div className="landing__container">
          <h2 className="landing__section-title">Как это работает</h2>
          
          <div className="landing__steps">
            <div className="landing__step">
              <div className="landing__step-number">1</div>
              <h3 className="landing__step-title">Создайте викторину</h3>
              <p className="landing__step-text">
                Используйте простой веб-интерфейс для создания вопросов или позвольте ИИ сгенерировать их за вас
              </p>
            </div>
            
            <div className="landing__step">
              <div className="landing__step-number">2</div>
              <h3 className="landing__step-title">Поделитесь кодом</h3>
              <p className="landing__step-text">
                Запустите игру и поделитесь уникальным кодом с участниками для присоединения
              </p>
            </div>
            
            <div className="landing__step">
              <div className="landing__step-number">3</div>
              <h3 className="landing__step-title">Играйте и зарабатывайте</h3>
              <p className="landing__step-text">
                Участвуйте в соревнованиях, получайте токены за верные ответы и занимайте место в таблице лидеров
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing__token" id="token">
        <div className="landing__container">
          <h2 className="landing__section-title">Экосистема токенов BlinkQuiz</h2>
          
          <div className="landing__token-info">
            <div className="landing__token-image"></div>
            <div className="landing__token-content">
              <h3 className="landing__token-title">Заработайте токены за знания</h3>
              <ul className="landing__token-list">
                <li className="landing__token-item">Получайте токены за правильные ответы и победы</li>
                <li className="landing__token-item">Обменивайте на NFT-бейджи и эксклюзивный доступ</li>
                <li className="landing__token-item">Участвуйте в турнирах с призовым фондом</li>
                <li className="landing__token-item">Создавайте мультисетевые соревнования с любым токеном</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="landing__cta-section">
        <div className="landing__container">
          <div className="landing__cta-box">
            <h2 className="landing__cta-title">Готовы начать?</h2>
            <p className="landing__cta-text">
              Создавайте увлекательные викторины, соревнуйтесь и зарабатывайте вместе с BlinkQuiz!
            </p>
            <Link to="/join" className="landing__button landing__button--large">Попробовать бесплатно</Link>
          </div>
        </div>
      </section>

      <footer className="landing__footer">
        <div className="landing__container">
          <div className="landing__footer-content">
            <div className="landing__footer-logo">BlinkQuiz</div>
            <div className="landing__footer-links">
              <div className="landing__footer-column">
                <h4 className="landing__footer-title">Платформа</h4>
                <ul className="landing__footer-list">
                  <li className="landing__footer-item"><a href="#features" className="landing__footer-link">Возможности</a></li>
                  <li className="landing__footer-item"><a href="#token" className="landing__footer-link">Токены</a></li>
                  <li className="landing__footer-item"><a href="#" className="landing__footer-link">Цены</a></li>
                </ul>
              </div>
              
              <div className="landing__footer-column">
                <h4 className="landing__footer-title">Ресурсы</h4>
                <ul className="landing__footer-list">
                  <li className="landing__footer-item"><a href="#" className="landing__footer-link">Документация</a></li>
                  <li className="landing__footer-item"><a href="#" className="landing__footer-link">API</a></li>
                  <li className="landing__footer-item"><a href="#" className="landing__footer-link">Сообщество</a></li>
                </ul>
              </div>
              
              <div className="landing__footer-column">
                <h4 className="landing__footer-title">Компания</h4>
                <ul className="landing__footer-list">
                  <li className="landing__footer-item"><a href="#" className="landing__footer-link">О нас</a></li>
                  <li className="landing__footer-item"><a href="#" className="landing__footer-link">Блог</a></li>
                  <li className="landing__footer-item"><a href="#" className="landing__footer-link">Контакты</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="landing__footer-bottom">
            <p className="landing__copyright">© 2025 BlinkQuiz. Все права защищены.</p>
            <div className="landing__social">
              <a href="#" className="landing__social-link landing__social-link--twitter"></a>
              <a href="#" className="landing__social-link landing__social-link--discord"></a>
              <a href="#" className="landing__social-link landing__social-link--telegram"></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 