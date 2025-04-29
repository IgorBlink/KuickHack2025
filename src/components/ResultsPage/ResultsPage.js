import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ResultsPage.css';
import logo from '../../assets/logo.png';
import { FaVolumeUp, FaExpand, FaUsers } from 'react-icons/fa';

const ResultsPage = () => {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [participants, setParticipants] = useState([]);
  const [classAccuracy, _setClassAccuracy] = useState(69);
  
  // Моковые данные для демонстрации
  useEffect(() => {
    // Симуляция загрузки данных о результатах
    const mockParticipants = [
      { 
        id: 1, 
        name: 'Vanilla Valjean', 
        score: 5100, 
        avatar: '🧁',
        correctPercentage: 85, 
        wrongPercentage: 15,
        streak: 1
      },
      { 
        id: 2, 
        name: 'Acorn Artemis', 
        score: 4200, 
        avatar: '🐿️',
        correctPercentage: 70, 
        wrongPercentage: 30,
        streak: 2
      },
      { 
        id: 3, 
        name: 'Fenugreek Fudge', 
        score: 3600, 
        avatar: '🍫',
        correctPercentage: 65, 
        wrongPercentage: 35,
        streak: 0
      },
      { 
        id: 4, 
        name: 'Mint Moriarty', 
        score: 3000, 
        avatar: '🧊',
        correctPercentage: 55, 
        wrongPercentage: 45,
        streak: 0
      }
    ];
    
    setParticipants(mockParticipants);
  }, []);
  
  // Моковые вопросы для демонстрации
  const mockQuestions = [
    {
      id: 1,
      text: 'Какая планета является самой большой в Солнечной системе?',
      correctAnswer: 'Юпитер',
      statistics: {
        correct: 75,
        incorrect: 25
      }
    },
    {
      id: 2,
      text: 'Какое химическое обозначение золота?',
      correctAnswer: 'Au',
      statistics: {
        correct: 65,
        incorrect: 35
      }
    },
    {
      id: 3,
      text: 'Какая страна является самой большой по площади?',
      correctAnswer: 'Россия',
      statistics: {
        correct: 85,
        incorrect: 15
      }
    },
    {
      id: 4,
      text: 'Кто написал "Война и мир"?',
      correctAnswer: 'Лев Толстой',
      statistics: {
        correct: 60,
        incorrect: 40
      }
    }
  ];
  
  useEffect(() => {
    // Пример расчета средней точности класса на основе данных участников
    if (participants.length > 0) {
      const totalAccuracy = participants.reduce((sum, participant) => 
        sum + participant.correctPercentage, 0);
      const averageAccuracy = Math.round(totalAccuracy / participants.length);
      _setClassAccuracy(averageAccuracy);
    }
  }, [participants]);
  
  const handleEndGame = () => {
    // В реальном приложении здесь был бы API-запрос на завершение игры
    navigate('/');
  };
  
  const handlePauseGame = () => {
    // В реальном приложении здесь была бы пауза игры
    console.log('Game paused');
  };
  
  return (
    <div className="results">
      {/* Фоновые элементы */}
      <div className="results__background">
        <div className="results__stars"></div>
        <div className="results__stars-2"></div>
        <div className="results__stars-3"></div>
      </div>
      
      {/* Хедер */}
      <div className="results__header">
        <div className="results__logo">
          <img src={logo} alt="Quizizz" className="results__logo-image" />
        </div>
        
        <div className="results__join-code">
          <div className="results__join-code-label">JOIN CODE</div>
          <div className="results__join-code-value">{gameCode || '404 364'}</div>
        </div>
        
        <div className="results__controls">
          {/* <button className="results__theme-button">
            <span className="results__theme-icon">🎨</span>
            Themes
          </button> */}
          <button className="results__audio-button">
            <FaVolumeUp />
          </button>
          <button className="results__fullscreen-button">
            <FaExpand />
          </button>
          {/* <button 
            className="results__pause-button"
            onClick={handlePauseGame}
          >
            <span className="results__pause-icon">⚡</span>
            Pause
          </button> */}
          {/* <button 
            className="results__end-button"
            onClick={handleEndGame}
          >
            End
          </button> */}
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="results__main">
        {/* Полосы прогресса */}
        <div className="results__progress-container">
          <div className="results__progress results__progress--correct" style={{ width: `${classAccuracy}%` }}></div>
          <div className="results__progress results__progress--incorrect" style={{ width: `${100 - classAccuracy}%` }}></div>
        </div>
        
        {/* Процент точности класса */}
        <div className="results__accuracy">
          <div className="results__accuracy-circle">
            <div className="results__accuracy-value">{classAccuracy}%</div>
            <div className="results__accuracy-label">Class<br />Accuracy</div>
          </div>
        </div>
        
        {/* Вкладки */}
        <div className="results__tabs">
          <button 
            className={`results__tab ${activeTab === 'leaderboard' ? 'results__tab--active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
          <button 
            className={`results__tab ${activeTab === 'questions' ? 'results__tab--active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            Questions
          </button>
        </div>
        
        {/* Контент вкладки Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="results__leaderboard">
            <div className="results__participants-count">
              <FaUsers /> {participants.length} participants
            </div>
            
            <div className="results__table">
              <div className="results__table-header">
                <div className="results__header-rank">Rank</div>
                <div className="results__header-name">Name</div>
                <div className="results__header-score">Score</div>
                <div className="results__header-progress"></div>
              </div>
              
              {participants.map((participant, index) => (
                <div key={participant.id} className="results__table-row">
                  <div className="results__cell-rank">{index + 1}</div>
                  <div className="results__cell-player">
                    <div className="results__player-avatar">{participant.avatar}</div>
                    <div className="results__player-name">{participant.name}</div>
                  </div>
                  <div className="results__cell-score">{participant.score}</div>
                  <div className="results__cell-progress">
                    <div className="results__player-progress">
                      <div 
                        className="results__progress-correct" 
                        style={{width: `${participant.correctPercentage}%`}}
                      >
                        {participant.streak > 0 && (
                          <div className="results__streak-badge">⚡{participant.streak}</div>
                        )}
                      </div>
                      <div 
                        className="results__progress-incorrect" 
                        style={{width: `${participant.wrongPercentage}%`}}
                      ></div>
                      <div 
                        className="results__progress-empty" 
                        style={{width: `${100 - participant.correctPercentage - participant.wrongPercentage}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="results__cell-action">×</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Контент вкладки Questions */}
        {activeTab === 'questions' && (
          <div className="results__questions">
            <div className="results__questions-list">
              {mockQuestions.map((question, index) => (
                <div key={question.id} className="results__question-item">
                  <div className="results__question-number">Q{index + 1}</div>
                  <div className="results__question-content">
                    <div className="results__question-text">{question.text}</div>
                    <div className="results__question-answer">
                      <span className="results__answer-label">Правильный ответ:</span> {question.correctAnswer}
                    </div>
                    <div className="results__question-stats">
                      <div className="results__stats-bar">
                        <div 
                          className="results__stats-correct" 
                          style={{width: `${question.statistics.correct}%`}}
                        >
                          {question.statistics.correct}%
                        </div>
                        <div 
                          className="results__stats-incorrect" 
                          style={{width: `${question.statistics.incorrect}%`}}
                        >
                          {question.statistics.incorrect}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage; 