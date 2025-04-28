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
  
  // Загрузка данных квиза с сервера
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // В реальном приложении:
        // const data = await quizzesAPI.getQuizById(id);
        // setQuiz(data);
        
        // Пока используем моковые данные для разработки
        setTimeout(() => {
          setQuiz({
            id: id,
            title: "Concepts in fractions",
            category: "Mathematics",
            grade: "1-й класс",
            plays: 805,
            rating: 4.5,
            questions: [
              {
                id: 1,
                type: "МНОЖЕСТВЕННЫЙ ВЫБОР",
                text: "If you divide a whole into 2 equal parts, one of the parts is ________ of the whole.",
                options: ["1/2", "1/3", "1/4", "2/1"],
                correct: 0,
                timeLimit: 30,
                points: 1
              },
              {
                id: 2,
                type: "МНОЖЕСТВЕННЫЙ ВЫБОР",
                text: "Does this shape have equal parts?",
                imageUrl: "https://via.placeholder.com/150",
                options: ["Yes", "No"],
                correct: 1,
                timeLimit: 60,
                points: 1
              },
              {
                id: 3,
                type: "МНОЖЕСТВЕННЫЙ ВЫБОР",
                text: "Brandon has two pieces of toast that are the same size. What are two different ways he can divide the toast into halves?",
                options: ["Horizontally and Vertically", "Diagonally and Horizontally", "In thirds and fourths", "In quarters only"],
                correct: 0,
                timeLimit: 30,
                points: 1
              },
              {
                id: 4,
                type: "МНОЖЕСТВЕННЫЙ ВЫБОР",
                text: "Jamal folded a piece of cloth into equal parts. What is the name for the parts?",
                imageUrl: "https://via.placeholder.com/150",
                options: ["Halves", "Thirds", "Quarters", "Sixths"],
                correct: 2,
                timeLimit: 30,
                points: 1
              },
              {
                id: 5,
                type: "МНОЖЕСТВЕННЫЙ ВЫБОР",
                text: "Which apple is cut in half?",
                options: ["Apple A", "Apple B", "Apple C", "Apple D"],
                correct: 1,
                timeLimit: 30,
                points: 1
              }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError('Не удалось загрузить квиз. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  const handleStartQuiz = () => {
    navigate(`/lobby/${id}`);
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
              <span className="quiz-page__rating">
                <span className="quiz-page__rating-icon">★</span>
                <span className="quiz-page__rating-text">Оценка</span>
              </span>
              <span className="quiz-page__category">
                <span className="quiz-page__category-icon">📊</span>
                <span className="quiz-page__category-text">{quiz.category}</span>
              </span>
              {/* <span className="quiz-page__grade">
                <span className="quiz-page__grade-icon">🎓</span>
                <span className="quiz-page__grade-text">{quiz.grade}</span>
              </span> */}
              {/* <span className="quiz-page__plays">
                <span className="quiz-page__plays-icon">🎮</span>
                <span className="quiz-page__plays-text">{quiz.plays} игры</span>
              </span> */}
              {/* <span className="quiz-page__stage">
                <span className="quiz-page__stage-icon">🚩</span>
                <span className="quiz-page__stage-text">Середина</span>
              </span> */}
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
              className="quiz-page__button quiz-page__button--primary"
              onClick={handleStartQuiz}
            >
              <span className="quiz-page__button-icon">▶️</span>
              Начать сейчас
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
                <span className="quiz-page__toggle-label">Показать варианты ответа</span>
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