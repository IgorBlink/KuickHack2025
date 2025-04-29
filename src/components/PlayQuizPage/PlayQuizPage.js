import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PlayQuizPage.css';
import logo from '../../assets/logo.png';

const PlayQuizPage = () => {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const timerId = useRef(null);
  
  // Состояния
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [score, setScore] = useState(0);
  const [quizData, setQuizData] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [soundEnabled] = useState(true);
  const [questions] = useState([
    {
      id: 1,
      text: 'Какая планета является самой большой в Солнечной системе?',
      options: ['Земля', 'Марс', 'Юпитер', 'Сатурн'],
      correctAnswer: 2, // Юпитер
      timeLimit: 20
    },
    {
      id: 2,
      text: 'Какое химическое обозначение золота?',
      options: ['Au', 'Ag', 'Fe', 'Cu'],
      correctAnswer: 0, // Au
      timeLimit: 15
    },
    {
      id: 3,
      text: 'Какая страна является самой большой по площади?',
      options: ['Китай', 'США', 'Канада', 'Россия'],
      correctAnswer: 3, // Россия
      timeLimit: 15
    },
    {
      id: 4,
      text: 'Кто написал "Война и мир"?',
      options: ['Федор Достоевский', 'Лев Толстой', 'Александр Пушкин', 'Николай Гоголь'],
      correctAnswer: 1, // Лев Толстой
      timeLimit: 20
    }
  ]);
  
  // Обработчик перехода к следующему вопросу
  const handleNextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      // Переход к следующему вопросу
      setCurrentQuestion(prevQuestion => prevQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowResult(false);
      setTimeLeft(questions[currentQuestion + 1]?.timeLimit || 20);
    } else {
      // Квиз завершен
      setQuizCompleted(true);
    }
  }, [currentQuestion, questions]);
  
  // Обработчик выбора ответа
  const handleAnswerSelect = useCallback((answerIndex) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    // Проверяем, правильный ли ответ
    const isCorrect = answerIndex === questions[currentQuestion]?.correctAnswer;
    
    if (isCorrect) {
      // Рассчитываем очки на основе оставшегося времени
      const pointsForCorrectAnswer = 1000;
      const timeBonus = Math.floor(timeLeft * 100);
      setScore(prevScore => prevScore + pointsForCorrectAnswer + timeBonus);
    }
    
    // Сначала показываем только выбранный ответ
    setTimeout(() => {
      setShowResult(true);
      
      setTimeout(() => {
        handleNextQuestion();
      }, 2000);
    }, 2000);
  }, [isAnswered, questions, currentQuestion, timeLeft, handleNextQuestion]);
  
  // Имитация загрузки данных квиза при монтировании
  useEffect(() => {
    console.log(`Загрузка квиза с кодом: ${gameCode}`);
    
    // Устанавливаем начальный таймер для первого вопроса
    if (questions.length > 0) {
      setTimeLeft(questions[0]?.timeLimit || 20);
    }
    
    // Очистка таймера при размонтировании
    return () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
    };
  }, [gameCode, questions]);
  
  // Обработка таймера
  useEffect(() => {
    // Если квиз завершен или ответ уже дан, не запускаем таймер
    if (quizCompleted || isAnswered) return;
    
    if (timeLeft > 0) {
      timerId.current = setTimeout(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Время вышло, переходим к следующему вопросу
      handleNextQuestion();
    }
    
    return () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
    };
  }, [timeLeft, isAnswered, quizCompleted, handleNextQuestion]);
  
  // Эффект для звука при ответе
  useEffect(() => {
    if (soundEnabled && isAnswered) {
      console.log('Звук ответа воспроизведен');
    }
  }, [isAnswered, soundEnabled]);
  
  // Эффект для перехода на страницу результатов
  useEffect(() => {
    if (quizCompleted) {
      const timer = setTimeout(() => {
        navigate(`/results/${gameCode}`);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [quizCompleted, navigate, gameCode]);
  
  // Расчет прогресса
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  
  // Функция для определения класса варианта ответа
  const getOptionClass = (index) => {
    if (!isAnswered) return '';
    
    if (selectedAnswer === index) {
      if (showResult) {
        return index === questions[currentQuestion].correctAnswer 
          ? 'play-quiz__option--correct' 
          : 'play-quiz__option--incorrect';
      }
      return 'play-quiz__option--selected';
    }
    
    if (showResult && index === questions[currentQuestion].correctAnswer) {
      return 'play-quiz__option--correct';
    }
    
    return '';
  };
  
  // Рендеринг компонента
  return (
    <div className="play-quiz">
      {/* Фоновые элементы */}
      <div className="play-quiz__stars"></div>
      <div className="play-quiz__stars-2"></div>
      <div className="play-quiz__stars-3"></div>
      
      {/* Хедер */}
      <div className="play-quiz__header">
        <div className="play-quiz__logo">
          <img src={logo} alt="Quiz App" className="play-quiz__logo-image" />
        </div>
        
        <div className="play-quiz__player-info">
          <div className="play-quiz__score">Score: {score}</div>
        </div>
      </div>
      
      {/* Прогресс бар */}
      <div className="play-quiz__progress-container">
        <div className="play-quiz__progress-bar">
          <div 
            className="play-quiz__progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="play-quiz__main">
        {!quizCompleted && questions[currentQuestion] && (
          <>
            {/* Контейнер вопроса */}
            <div className="play-quiz__question-container">
              <div className="play-quiz__question-number">
                Вопрос {currentQuestion + 1} из {questions.length}
              </div>
              <div className="play-quiz__question-text">
                {questions[currentQuestion].text}
              </div>
              
              {/* Таймер */}
              <div className="play-quiz__timer-container">
                <div className="play-quiz__timer-text">{timeLeft}</div>
                <div className="play-quiz__timer-progress">
                  <div 
                    className="play-quiz__timer-fill" 
                    style={{ 
                      width: `${(timeLeft / (questions[currentQuestion]?.timeLimit || 20)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Варианты ответов */}
            <div className="play-quiz__options">
              {questions[currentQuestion].options.map((option, index) => (
                <button 
                  key={index}
                  className={`play-quiz__option ${getOptionClass(index)}`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
        
        {quizCompleted && (
          <div className="play-quiz__completed">
            <h2>Квиз завершен!</h2>
            <p>Переход на страницу результатов...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayQuizPage; 