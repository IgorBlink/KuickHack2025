import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './QuizPage.css';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import quizzesAPI from '../../api/quizzes';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [error, setError] = useState(null);
  const [creatingLobby, setCreatingLobby] = useState(false);
  
  // Загрузка данных квиза с сервера
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Запрос будет кэшироваться
        const response = await quizzesAPI.getQuizById(id);
        
        if (response.success && response.quiz) {
          const adaptedQuiz = adaptQuizData(response.quiz);
          setQuiz(adaptedQuiz);
        } else {
          throw new Error('Неверный формат данных от API');
        }
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError('Не удалось загрузить квиз. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // Функция для адаптации данных от API к формату компонента
  const adaptQuizData = (apiQuiz) => {
    // Создаем вопросы в нужном формате
    const questions = apiQuiz.questions.map((q, index) => {
      // Находим индекс правильного ответа (первый true в массиве correctAnswers)
      const correctIndex = q.correctAnswers.findIndex(answer => answer === true);
      
      return {
        id: index + 1,
        type: "МНОЖЕСТВЕННЫЙ ВЫБОР",
        text: q.questionText,
        options: q.options,
        correct: correctIndex, // Индекс правильного ответа
        timeLimit: 30, // Дефолтное значение, можно настроить
        points: 1    // Дефолтное значение, можно настроить
      };
    });

    // Форматируем дату создания
    const createdAt = new Date(apiQuiz.createdAt);
    const formattedDate = createdAt.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Возвращаем адаптированный объект квиза
    return {
      id: apiQuiz._id,
      title: apiQuiz.title,
      description: apiQuiz.description,
      category: "IT и программирование", // Можно настроить или получать из API
      createdAt: formattedDate,
      questions: questions
    };
  };

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  const handleStartQuiz = async () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { redirectTo: `/quiz/${id}` } });
      return;
    }
    
    try {
      setCreatingLobby(true);
      // Создаем лобби через API
      const lobbyData = await quizzesAPI.createLobby({
        quizId: id,
        baseReward: 300,
        withReward: true
      });
      
      // Перенаправляем на страницу лобби с полученным кодом
      navigate(`/lobby/${lobbyData.code || lobbyData._id}`);
    } catch (err) {
      console.error('Ошибка создания лобби:', err);
      setError('Не удалось создать лобби. Пожалуйста, попробуйте позже.');
    } finally {
      setCreatingLobby(false);
    }
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="quiz-page__stars"></div>
        <div className="quiz-page__stars-2"></div>
        <div className="quiz-page__stars-3"></div>
        <div className="quiz-page__loading">
          <div className="quiz-page__spinner"></div>
          <p>Загрузка квиза...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-page">
        <div className="quiz-page__stars"></div>
        <div className="quiz-page__stars-2"></div>
        <div className="quiz-page__stars-3"></div>
        <div className="quiz-page__error">
          <h2>Ошибка</h2>
          <p>{error}</p>
          <Link to="/admin" className="quiz-page__button quiz-page__button--primary">
            Вернуться к списку квизов
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-page__stars"></div>
      <div className="quiz-page__stars-2"></div>
      <div className="quiz-page__stars-3"></div>
      
      <div className="quiz-page__container">
        {/* Верхняя часть с информацией о квизе */}
        <div className="quiz-page__header">
          <div className="quiz-page__info">
            <h1 className="quiz-page__title">{quiz.title}</h1>
            <div className="quiz-page__meta">
              <span className="quiz-page__category">
                <span className="quiz-page__category-icon">📊</span>
                <span className="quiz-page__category-text">{quiz.category}</span>
              </span>
              <span className="quiz-page__description">
                <span className="quiz-page__description-icon">📝</span>
                <span className="quiz-page__description-text">{quiz.description}</span>
              </span>
              <span className="quiz-page__created-at">
                <span className="quiz-page__created-at-icon">📅</span>
                <span className="quiz-page__created-at-text">Создан: {quiz.createdAt}</span>
              </span>
            </div>
          </div>
          
          <div className="quiz-page__actions">
            <button className="quiz-page__button quiz-page__button--outline">
              <span className="quiz-page__button-icon">✏️</span>
              Копировать и редактировать
            </button>
            <div className="quiz-page__dropdown">
              <button className="quiz-page__button quiz-page__button--outline">
                <span className="quiz-page__button-icon">↗️</span>
                Делиться
              </button>
            </div>
            <button className="quiz-page__button quiz-page__button--outline">
              <span className="quiz-page__button-icon">📄</span>
              Рабочий лист
            </button>
            <button 
              className={`quiz-page__button quiz-page__button--primary ${creatingLobby ? 'quiz-page__button--loading' : ''}`}
              onClick={handleStartQuiz}
              disabled={creatingLobby}
            >
              <span className="quiz-page__button-icon">▶️</span>
              {creatingLobby ? 'Создание лобби...' : 'Начать сейчас'}
            </button>
          </div>
        </div>
        
        {/* Главная часть с вопросами */}
        <div className="quiz-page__content">
          <div className="quiz-page__questions-header">
            <div className="quiz-page__questions-count">
              {quiz.questions.length} ВОПРОСОВ
            </div>
            <div className="quiz-page__toggle-answers">
              <label className="quiz-page__toggle">
                <span className="quiz-page__toggle-label">Показать правильные ответы</span>
                <input 
                  type="checkbox" 
                  checked={showAnswers} 
                  onChange={toggleAnswers}
                  className="quiz-page__toggle-input"
                />
                <span className="quiz-page__toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div className="quiz-page__questions-list">
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="quiz-page__question-card">
                <div className="quiz-page__question-header">
                  <div className="quiz-page__question-number">{index + 1}. {question.type}</div>
                  <div className="quiz-page__question-meta">
                    <span className="quiz-page__question-time">{question.timeLimit} сек</span>
                    <span className="quiz-page__question-points">{question.points} pt</span>
                  </div>
                </div>
                
                <div className="quiz-page__question-content">
                  <div className="quiz-page__question-text">{question.text}</div>
                  
                  {question.imageUrl && (
                    <div className="quiz-page__question-image">
                      <img src={question.imageUrl} alt={`Вопрос ${index + 1}`} />
                    </div>
                  )}
                  
                  {showAnswers && (
                    <div className="quiz-page__options">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex} 
                          className={`quiz-page__option ${optionIndex === question.correct ? 'quiz-page__option--correct' : ''}`}
                        >
                          {option}
                          {optionIndex === question.correct && (
                            <span className="quiz-page__correct-marker">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage; 