import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './PlayQuizPage.css';
import logo from '../../assets/logo.png';

const PlayQuizPage = () => {
  const { gameCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const playerName = location.state?.playerName || 'Игрок';
  const playerSettings = location.state?.settings || { memes: true, soundEffects: true, readAloud: false };
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizData, setQuizData] = useState({
    title: 'Тема',
    questions: [
      {
        id: 1,
        text: 'Какая планета ближе всего к Солнцу?',
        options: ['Венера', 'Меркурий', 'Марс', 'Земля'],
        correctAnswer: 1,
        timeLimit: 30,
        points: 100
      },
      {
        id: 2,
        text: 'Кто написал роман "Война и мир"?',
        options: ['Федор Достоевский', 'Лев Толстой', 'Александр Пушкин', 'Иван Тургенев'],
        correctAnswer: 1,
        timeLimit: 30,
        points: 100
      },
      {
        id: 3,
        text: 'Какая формула представляет теорию относительности Эйнштейна?',
        options: ['E=mc²', 'F=ma', 'PV=nRT', 'E=hf'],
        correctAnswer: 0,
        timeLimit: 30,
        points: 150
      },
      {
        id: 4,
        text: 'Какое самое глубокое озеро в мире?',
        options: ['Каспийское море', 'Озеро Байкал', 'Озеро Виктория', 'Великие озера'],
        correctAnswer: 1,
        timeLimit: 30,
        points: 100
      },
      {
        id: 5,
        text: 'Кто является автором картины "Звездная ночь"?',
        options: ['Клод Моне', 'Пабло Пикассо', 'Винсент Ван Гог', 'Леонардо да Винчи'],
        correctAnswer: 2,
        timeLimit: 30,
        points: 120
      }
    ]
  });

  // Имитация загрузки данных с сервера
  useEffect(() => {
    // В реальном приложении здесь будет API-запрос для получения данных квиза
    console.log(`Загрузка квиза с кодом ${gameCode} для игрока ${playerName}`);
    
    // Здесь бы был запрос к API
    // const fetchQuizData = async () => {
    //   try {
    //     const response = await api.get(`/quizzes/play/${gameCode}`);
    //     setQuizData(response.data);
    //     setTimeLeft(response.data.questions[0].timeLimit);
    //   } catch (error) {
    //     console.error('Ошибка при загрузке квиза:', error);
    //   }
    // };
    // fetchQuizData();
    
    // Вместо этого просто устанавливаем таймер
    setTimeLeft(quizData.questions[0].timeLimit);
  }, [gameCode, playerName, quizData.questions]);

  // Обработка таймера вопроса
  useEffect(() => {
    if (timeLeft > 0 && !showAnswer) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showAnswer) {
      // Время истекло, показываем правильный ответ
      handleTimeUp();
    }
  }, [timeLeft, showAnswer]);

  const handleTimeUp = () => {
    // Показываем правильный ответ
    setShowAnswer(true);
    
    // Через 3 секунды переходим к следующему вопросу
    setTimeout(() => {
      goToNextQuestion();
    }, 3000);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (showAnswer) return; // Не позволяем изменять ответ после окончания времени
    
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);
    
    // Проверяем, правильный ли ответ и начисляем очки
    const currentQ = quizData.questions[currentQuestion];
    if (answerIndex === currentQ.correctAnswer) {
      // Формула подсчета очков: базовые очки + дополнительные очки за скорость ответа
      const timeBonus = Math.floor((timeLeft / currentQ.timeLimit) * 50);
      const pointsEarned = currentQ.points + timeBonus;
      setScore(score + pointsEarned);
    }
    
    // Через 3 секунды переходим к следующему вопросу
    setTimeout(() => {
      goToNextQuestion();
    }, 3000);
  };

  const goToNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      // Переход к следующему вопросу
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setTimeLeft(quizData.questions[currentQuestion + 1].timeLimit);
    } else {
      // Квиз завершен, показываем результаты
      navigate(`/results/${gameCode}`, { 
        state: { 
          playerName, 
          score, 
          totalQuestions: quizData.questions.length 
        } 
      });
    }
  };

  const getCurrentQuestion = () => {
    return quizData.questions[currentQuestion];
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / quizData.questions.length) * 100;
  };

  const getTimerPercentage = () => {
    const question = getCurrentQuestion();
    return (timeLeft / question.timeLimit) * 100;
  };

  return (
    <div className="play-quiz">
      <div className="play-quiz__stars"></div>
      <div className="play-quiz__stars-2"></div>
      <div className="play-quiz__stars-3"></div>

      <div className="play-quiz__header">
        <div className="play-quiz__logo">
          <img src={logo} alt="Logo" />
        </div>
        <div className="play-quiz__player-info">
          <div className="play-quiz__player-name">{playerName}</div>
          <div className="play-quiz__score">{score} баллов</div>
        </div>
        <div className="play-quiz__game-info">
          <div className="play-quiz__game-title">{quizData.title}</div>
          <div className="play-quiz__game-code">Код игры: {gameCode}</div>
        </div>
      </div>

      <div className="play-quiz__progress-bar">
        <div 
          className="play-quiz__progress-fill" 
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      </div>

      <div className="play-quiz__content">
        <div className="play-quiz__question-container">
          <div className="play-quiz__question-header">
            <div className="play-quiz__question-number">
              Вопрос {currentQuestion + 1} из {quizData.questions.length}
            </div>
            <div className="play-quiz__timer-container">
              <div className="play-quiz__timer-text">{timeLeft}</div>
              <div className="play-quiz__timer-bar">
                <div 
                  className="play-quiz__timer-fill" 
                  style={{ 
                    width: `${getTimerPercentage()}%`,
                    backgroundColor: timeLeft < 10 ? '#ff5757' : '#5271ff'
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="play-quiz__question-text">
            {getCurrentQuestion().text}
          </div>

          <div className="play-quiz__options">
            {getCurrentQuestion().options.map((option, index) => (
              <button
                key={index}
                className={`play-quiz__option ${selectedAnswer === index ? 'play-quiz__option--selected' : ''} ${
                  showAnswer && index === getCurrentQuestion().correctAnswer ? 'play-quiz__option--correct' : ''
                } ${
                  showAnswer && selectedAnswer === index && index !== getCurrentQuestion().correctAnswer ? 'play-quiz__option--incorrect' : ''
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={showAnswer}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayQuizPage; 