import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminPage.css';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';

// Моковые данные для тем квизов
const QUIZ_CATEGORIES = [
  {
    id: 'math',
    title: 'Математика',
    quizzes: [
      { id: 'numbers', title: 'Числа', activity: '779.3K активности' },
      { id: 'fractions', title: 'Дроби', activity: '895 активности' },
      { id: 'operations', title: 'Операции с дробями', activity: '3.9K активности' },
      { id: 'factors', title: 'Множители и кратные', activity: '15.1K активности' },
      { id: 'whole-numbers', title: 'Концепции целых чисел', activity: '1.4K активности' },
      { id: 'operations-whole', title: 'Операции с целыми числами', activity: '5K активности' }
    ]
  },
  {
    id: 'algebra',
    title: 'Алгебра',
    quizzes: [
      { id: 'algebra-intro', title: 'Основы алгебры', activity: '112.3K активности' },
      { id: 'expressions', title: 'Алгебраические выражения', activity: '22K активности' },
      { id: 'linear-eq', title: 'Линейные уравнения (одна переменная)', activity: '7.9K активности' },
      { id: 'linear-ineq', title: 'Линейные неравенства (одна переменная)', activity: '1.7K активности' },
      { id: 'linear-eq-two', title: 'Линейные уравнения (две переменные)', activity: '6.6K активности' },
      { id: 'equation-line', title: 'Уравнение прямой линии', activity: '31K активности' }
    ]
  },
  {
    id: 'geometry',
    title: 'Геометрия',
    quizzes: [
      { id: 'geometry-intro', title: 'Основы геометрии', activity: '89.7K активности' },
      { id: 'triangles', title: 'Треугольники', activity: '46.2K активности' },
      { id: 'quadrilaterals', title: 'Четырехугольники', activity: '31.5K активности' },
      { id: 'circles', title: 'Окружности', activity: '55.1K активности' },
      { id: 'polygons', title: 'Многоугольники', activity: '22.8K активности' },
      { id: 'congruence', title: 'Конгруэнтность', activity: '18.3K активности' }
    ]
  },
  {
    id: 'web3',
    title: 'Web3 и блокчейн',
    quizzes: [
      { id: 'crypto-basics', title: 'Основы криптовалют', activity: '112.3K активности' },
      { id: 'blockchain', title: 'Блокчейн-технологии', activity: '89.5K активности' },
      { id: 'nft', title: 'NFT и цифровые активы', activity: '76.2K активности' },
      { id: 'defi', title: 'DeFi и финансовые приложения', activity: '62.1K активности' },
      { id: 'dao', title: 'DAO и децентрализованное управление', activity: '41.8K активности' },
      { id: 'web3-dev', title: 'Web3-разработка', activity: '37.5K активности' }
    ]
  }
];

const AdminPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories] = useState(QUIZ_CATEGORIES);
  const [filteredCategories, setFilteredCategories] = useState(QUIZ_CATEGORIES);
  const [activeTab, setActiveTab] = useState('foryou');

  // Фильтрация тем по поисковому запросу
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = categories.map(category => {
      const filteredQuizzes = category.quizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(query)
      );
      
      return {
        ...category,
        quizzes: filteredQuizzes
      };
    }).filter(category => category.quizzes.length > 0);
    
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="admin">
      <div className="admin__stars"></div>
      <div className="admin__stars-2"></div>
      <div className="admin__stars-3"></div>
      
      <header className="admin__header">
        <div className="admin__header-container">
          <Link to="/" className="admin__logo">
            <img src={logo} alt="BlinkQuiz" />
          </Link>
          
          <div className="admin__user-section">
            {isAuthenticated ? (
              <div className="admin__user-info">
                <span className="admin__username">
                  {user?.username || 'Администратор'}
                </span>
                <Link to="/" className="admin__button admin__button--outline">
                  На главную
                </Link>
              </div>
            ) : (
              <Link to="/auth" className="admin__button admin__button--primary">
                Войти
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="admin__main">
        <div className="admin__container">
          <div className="admin__title-section">
            <h1 className="admin__title">Чему вы учите сегодня?</h1>
            
            <div className="admin__search-container">
              <div className="admin__search-wrapper">
                <div className="admin__search-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  className="admin__search-input"
                  placeholder="Искать любую тему"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button className="admin__search-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="admin__tabs">
            <button 
              className={`admin__tab ${activeTab === 'foryou' ? 'admin__tab--active' : ''}`}
              onClick={() => handleTabClick('foryou')}
            >
              Для вас
            </button>
            <button 
              className={`admin__tab ${activeTab === 'scoring' ? 'admin__tab--active' : ''}`}
              onClick={() => handleTabClick('scoring')}
            >
              Оценивание
            </button>
            <button 
              className={`admin__tab ${activeTab === 'lessons' ? 'admin__tab--active' : ''}`}
              onClick={() => handleTabClick('lessons')}
            >
              Уроки
            </button>
            <button 
              className={`admin__tab ${activeTab === 'videos' ? 'admin__tab--active' : ''}`}
              onClick={() => handleTabClick('videos')}
            >
              Интерактивные видео
            </button>
            <button 
              className={`admin__tab ${activeTab === 'clips' ? 'admin__tab--active' : ''}`}
              onClick={() => handleTabClick('clips')}
            >
              Отрывки
            </button>
          </div>

          <section className="admin__trending">
            <div className="admin__section-header">
              <h2 className="admin__section-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                Трендовые квизы
              </h2>
            </div>

            {filteredCategories.map(category => (
              <div key={category.id} className="admin__category">
                <div className="admin__quizzes-grid">
                  {category.quizzes.map(quiz => (
                    <Link to={`/quiz/${quiz.id}`} key={quiz.id} className="admin__quiz-card">
                      <div className="admin__quiz-icon">
                        <svg className="admin__quiz-icon-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="50" cy="50" r="40" fill="#3a86ff" opacity="0.2" />
                          <circle cx="50" cy="50" r="30" fill="#3a86ff" opacity="0.4" />
                          <circle cx="50" cy="50" r="20" fill="#3a86ff" opacity="0.6" />
                          {quiz.id.includes('numbers') && (
                            <text x="50" y="55" fontSize="20" fontWeight="bold" textAnchor="middle" fill="white">123</text>
                          )}
                          {quiz.id.includes('algebra') && (
                            <text x="50" y="55" fontSize="20" fontWeight="bold" textAnchor="middle" fill="white">x+y</text>
                          )}
                          {quiz.id.includes('geometry') && (
                            <text x="50" y="55" fontSize="20" fontWeight="bold" textAnchor="middle" fill="white">△◻</text>
                          )}
                          {quiz.id.includes('web3') && (
                            <text x="50" y="55" fontSize="20" fontWeight="bold" textAnchor="middle" fill="white">₿</text>
                          )}
                          {!quiz.id.includes('numbers') && !quiz.id.includes('algebra') && 
                           !quiz.id.includes('geometry') && !quiz.id.includes('web3') && (
                            <text x="50" y="55" fontSize="20" fontWeight="bold" textAnchor="middle" fill="white">Q</text>
                          )}
                        </svg>
                      </div>
                      <div className="admin__quiz-info">
                        <h3 className="admin__quiz-title">{quiz.title}</h3>
                        <p className="admin__quiz-activity">{quiz.activity}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminPage; 