import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import quizzesAPI from '../../api/quizzes';
import './CreateQuizPage.css';
import logo from '../../assets/logo.png';

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [aiAssistantActive, setAiAssistantActive] = useState(false);
  const [aiGeneration, setAiGeneration] = useState({
    topic: '',
    quantity: 5,
    isLoading: false
  });
  const [aiGenerationMode, setAiGenerationMode] = useState('text'); // 'text' или 'image'
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  // Состояние для формы квиза
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: [
      {
        questionText: '',
        options: ['', ''],
        correctAnswers: [false, false]
      }
    ]
  });

  // Эффект для проверки авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { redirectTo: '/create-quiz', isLogin: true } });
    }
  }, [isAuthenticated, navigate]);

  // Обработчик изменения основных полей квиза
  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик изменения текста вопроса
  const handleQuestionTextChange = (questionIndex, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].questionText = value;
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Обработчик изменения варианта ответа
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Обработчик изменения правильности ответа
  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].correctAnswers[optionIndex] = !updatedQuestions[questionIndex].correctAnswers[optionIndex];
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Добавление нового вопроса
  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          options: ['', ''],
          correctAnswers: [false, false]
        }
      ]
    }));
  };

  // Удаление вопроса
  const removeQuestion = (questionIndex) => {
    if (quizData.questions.length <= 1) {
      showNotification('error', 'Нельзя удалить единственный вопрос');
      return;
    }
    
    const updatedQuestions = quizData.questions.filter((_, index) => index !== questionIndex);
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Добавление варианта ответа к вопросу
  const addOption = (questionIndex) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].options.push('');
    updatedQuestions[questionIndex].correctAnswers.push(false);
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Удаление варианта ответа
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quizData.questions];
    
    // Проверка, что остается минимум 2 варианта ответа
    if (updatedQuestions[questionIndex].options.length <= 2) {
      showNotification('error', 'Минимум должно быть два варианта ответа');
      return;
    }
    
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter((_, index) => index !== optionIndex);
    updatedQuestions[questionIndex].correctAnswers = updatedQuestions[questionIndex].correctAnswers.filter((_, index) => index !== optionIndex);
    
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Проверка валидности данных перед отправкой
  const validateForm = () => {
    // Проверка заголовка и описания
    if (!quizData.title.trim()) {
      showNotification('error', 'Заголовок квиза не может быть пустым');
      return false;
    }
    
    if (!quizData.description.trim()) {
      showNotification('error', 'Описание квиза не может быть пустым');
      return false;
    }
    
    // Проверка вопросов
    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i];
      
      if (!question.questionText.trim()) {
        showNotification('error', `Вопрос ${i+1} не может быть пустым`);
        return false;
      }
      
      // Проверка вариантов ответов
      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].trim()) {
          showNotification('error', `Вариант ответа ${j+1} в вопросе ${i+1} не может быть пустым`);
          return false;
        }
      }
      
      // Проверка, что хотя бы один ответ отмечен как правильный
      if (!question.correctAnswers.some(answer => answer)) {
        showNotification('error', `В вопросе ${i+1} должен быть отмечен хотя бы один правильный ответ`);
        return false;
      }
    }
    
    return true;
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await quizzesAPI.createQuiz(quizData);
      
      if (response.success) {
        showNotification('success', 'Квиз успешно создан!');
        
        // Перенаправление на страницу созданного квиза
        setTimeout(() => {
          navigate(`/quiz/${response.quiz._id}`);
        }, 2000);
      } else {
        showNotification('error', response.message || 'Ошибка при создании квиза');
      }
    } catch (error) {
      console.error('Create quiz error:', error);
      showNotification('error', 'Произошла ошибка при создании квиза. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Отображение уведомления
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    
    // Автоматическое скрытие уведомления через 5 секунд
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Закрытие уведомления
  const closeNotification = () => {
    setNotification({ show: false, type: '', message: '' });
  };

  // Вернуться назад
  const handleCancel = () => {
    navigate(-1);
  };

  // Функция для генерации квиза с помощью ИИ
  const handleAiGeneration = async (e) => {
    e.preventDefault();
    
    if (aiGenerationMode === 'text') {
      if (!aiGeneration.topic) {
        showNotification('error', 'Укажите тему для генерации квиза');
        return;
      }
      
      if (aiGeneration.quantity < 1 || aiGeneration.quantity > 10) {
        showNotification('error', 'Количество вопросов должно быть от 1 до 10');
        return;
      }
    } else if (aiGenerationMode === 'image') {
      if (!imageFile) {
        showNotification('error', 'Загрузите изображение для генерации квиза');
        return;
      }
    }
    
    try {
      setAiGeneration(prev => ({ ...prev, isLoading: true }));
      showNotification('success', 'Генерация квиза началась. Это может занять некоторое время...');
      
      let response;
      if (aiGenerationMode === 'text') {
        response = await quizzesAPI.generateQuizWithAI(
          aiGeneration.topic,
          aiGeneration.quantity
        );
      } else if (aiGenerationMode === 'image') {
        response = await quizzesAPI.generateQuizFromImage(imageFile);
      }
      
      // Проверяем разные возможные форматы ответа от API
      if (response) {
        let quizTitle = '';
        let quizDescription = '';
        let quizQuestions = [];
        
        // Вариант 1: Ответ содержит объект quiz с вопросами
        if (response.quiz) {
          quizTitle = response.quiz.title || `Квиз на тему: ${aiGeneration.topic}`;
          quizDescription = response.quiz.description || `Автоматически сгенерированный квиз на тему ${aiGeneration.topic}`;
          
          if (Array.isArray(response.quiz.questions)) {
            quizQuestions = response.quiz.questions.map(q => ({
              questionText: q.questionText || q.text || '',
              options: Array.isArray(q.options) ? q.options : [],
              correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : 
                             (Array.isArray(q.options) ? q.options.map((_, idx) => idx === q.correctAnswer) : [])
            }));
          }
        } 
        // Вариант 2: Ответ уже содержит заголовок, описание и вопросы на верхнем уровне
        else if (response.title || response.questions) {
          quizTitle = response.title || `Квиз на тему: ${aiGeneration.topic}`;
          quizDescription = response.description || `Автоматически сгенерированный квиз на тему ${aiGeneration.topic}`;
          
          if (Array.isArray(response.questions)) {
            quizQuestions = response.questions.map(q => ({
              questionText: q.questionText || q.text || '',
              options: Array.isArray(q.options) ? q.options : [],
              correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : 
                             (Array.isArray(q.options) ? q.options.map((_, idx) => idx === q.correctAnswer) : [])
            }));
          }
        }
        
        // Проверяем, что у нас есть хотя бы один вопрос
        if (quizQuestions.length === 0) {
          showNotification('error', 'Не удалось распознать формат вопросов в ответе ИИ. Попробуйте другую тему.');
          setAiGeneration(prev => ({ ...prev, isLoading: false }));
          return;
        }
        
        // Убеждаемся, что у каждого вопроса есть минимум 2 варианта ответа
        quizQuestions = quizQuestions.map(question => {
          // Если нет вариантов ответа, добавляем 2 пустых
          if (!Array.isArray(question.options) || question.options.length < 2) {
            return {
              ...question,
              options: question.options?.length ? [...question.options, ''] : ['', ''],
              correctAnswers: question.options?.length ? [...question.correctAnswers, false] : [true, false]
            };
          }
          
          // Если нет правильных ответов, устанавливаем первый как правильный
          if (!Array.isArray(question.correctAnswers) || !question.correctAnswers.some(ans => ans)) {
            const correctAnswers = question.options.map((_, idx) => idx === 0);
            return { ...question, correctAnswers };
          }
          
          return question;
        });
        
        // Заполняем форму данными из ответа
        setQuizData({
          title: quizTitle,
          description: quizDescription,
          questions: quizQuestions
        });
        
        // Закрываем окно ИИ-ассистента
        setAiAssistantActive(false);
        showNotification('success', 'Квиз успешно сгенерирован! Вы можете отредактировать его перед сохранением.');
      } else {
        showNotification('error', 'Не удалось сгенерировать квиз. Попробуйте другую тему.');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      showNotification('error', 'Произошла ошибка при генерации квиза. Попробуйте позже.');
    } finally {
      setAiGeneration(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Обработчик изменения полей ИИ-генерации
  const handleAiInputChange = (e) => {
    const { name, value } = e.target;
    setAiGeneration(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик выбора файла изображения
  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB лимит
        showNotification('error', 'Размер файла не должен превышать 5МБ');
        return;
      }
      
      // Проверка типа файла
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        showNotification('error', 'Разрешены только изображения в формате JPG, JPEG или PNG');
        return;
      }
      
      setImageFile(file);
    }
  };

  // Функция для открытия диалога выбора файла
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Функция сброса выбранного файла
  const resetImageFile = () => {
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="create-quiz">
      {/* Звездный фон */}
      <div className="create-quiz__stars"></div>
      <div className="create-quiz__stars-2"></div>
      <div className="create-quiz__stars-3"></div>
      
      {/* Хедер */}
      <header className="create-quiz__header">
        <div className="create-quiz__header-container">
          <Link to="/" className="create-quiz__logo">
            <img src={logo} alt="BlinkQuiz" />
          </Link>
          
          <div className="create-quiz__title-container">
            <h1 className="create-quiz__page-title">Создание квиза</h1>
          </div>
          
          <div className="create-quiz__actions-group">
            <button 
              className="create-quiz__button create-quiz__button--outline"
              onClick={handleCancel}
            >
              Отмена
            </button>
          </div>
        </div>
      </header>
      
      {/* Основное содержимое */}
      <main className="create-quiz__main">
        <div className="create-quiz__container">
          {/* Кнопка активации ИИ-ассистента */}
          <div className="create-quiz__ai-button-container">
            <button
              type="button"
              className={`create-quiz__ai-button ${aiAssistantActive ? 'create-quiz__ai-button--active' : ''}`}
              onClick={() => setAiAssistantActive(!aiAssistantActive)}
            >
              <div className="create-quiz__ai-button-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V7h2a2 2 0 0 1 2 2v.28c.6.34 1 .98 1 1.72a2 2 0 0 1-2 2 2 2 0 0 1-2 2v2a2 2 0 1 1-4 0v-2a2 2 0 0 1-2-2 2 2 0 0 1-2-2c0-.74.4-1.38 1-1.72V9a2 2 0 0 1 2-2h2V5.72c-.6-.34-1-.98-1-1.72a2 2 0 0 1 2-2z"></path>
                </svg>
              </div>
              <span>{aiAssistantActive ? 'Вернуться к ручному созданию' : 'ИИ-ассистент генерации квизов'}</span>
            </button>
          </div>
          
          {/* Панель ИИ-ассистента */}
          {aiAssistantActive ? (
            <div className="create-quiz__ai-panel">
              <div className="create-quiz__ai-header">
                <h3 className="create-quiz__ai-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V7h2a2 2 0 0 1 2 2v.28c.6.34 1 .98 1 1.72a2 2 0 0 1-2 2 2 2 0 0 1-2 2v2a2 2 0 1 1-4 0v-2a2 2 0 0 1-2-2 2 2 0 0 1-2-2c0-.74.4-1.38 1-1.72V9a2 2 0 0 1 2-2h2V5.72c-.6-.34-1-.98-1-1.72a2 2 0 0 1 2-2z"></path>
                  </svg>
                  ИИ-ассистент генерации квизов
                </h3>
                <button 
                  className="create-quiz__ai-close"
                  onClick={() => setAiAssistantActive(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className="create-quiz__ai-content">
                <p className="create-quiz__ai-description">
                  {aiGenerationMode === 'text' 
                    ? 'Укажите тему и количество вопросов, и наш ИИ-ассистент автоматически сгенерирует квиз для вас!'
                    : 'Загрузите изображение контрольной работы или конспекта, и наш ИИ-ассистент автоматически сгенерирует квиз на его основе!'}
                </p>
                
                <div className="create-quiz__ai-mode-selector">
                  <button 
                    type="button"
                    className={`create-quiz__ai-mode-button ${aiGenerationMode === 'text' ? 'create-quiz__ai-mode-button--active' : ''}`}
                    onClick={() => setAiGenerationMode('text')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Текст
                  </button>
                  <button 
                    type="button"
                    className={`create-quiz__ai-mode-button ${aiGenerationMode === 'image' ? 'create-quiz__ai-mode-button--active' : ''}`}
                    onClick={() => setAiGenerationMode('image')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    Изображение
                  </button>
                </div>
                
                <form className="create-quiz__ai-form" onSubmit={handleAiGeneration}>
                  {aiGenerationMode === 'text' ? (
                    <>
                      <div className="create-quiz__field">
                        <label htmlFor="ai-topic" className="create-quiz__label">Тема квиза *</label>
                        <input
                          type="text"
                          id="ai-topic"
                          name="topic"
                          className="create-quiz__input"
                          placeholder="Например: История России, JavaScript, Математика..."
                          value={aiGeneration.topic}
                          onChange={handleAiInputChange}
                          required
                        />
                      </div>
                      
                      <div className="create-quiz__field">
                        <label htmlFor="ai-quantity" className="create-quiz__label">Количество вопросов (1-10) *</label>
                        <input
                          type="number"
                          id="ai-quantity"
                          name="quantity"
                          className="create-quiz__input"
                          min="1"
                          max="10"
                          value={aiGeneration.quantity}
                          onChange={handleAiInputChange}
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <div className="create-quiz__field">
                      <label className="create-quiz__label">Изображение контрольной работы или конспекта *</label>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="create-quiz__file-input"
                        onChange={handleImageFileChange}
                        style={{ display: 'none' }}
                      />
                      
                      {!imageFile ? (
                        <div className="create-quiz__image-upload" onClick={triggerFileInput}>
                          <div className="create-quiz__image-upload-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                              <path d="M17 12v-2"></path>
                              <path d="M12 13V7"></path>
                              <path d="M3 16l5-5 5 5"></path>
                              <path d="M18 2l4 4"></path>
                              <path d="M17 8l.5-.5"></path>
                              <path d="M2 12l5 5 5-5"></path>
                            </svg>
                          </div>
                          <div className="create-quiz__image-upload-text">
                            <span>Нажмите для загрузки</span>
                            <small>JPEG, JPG или PNG, макс. 5MB</small>
                          </div>
                        </div>
                      ) : (
                        <div className="create-quiz__image-preview">
                          <div className="create-quiz__image-preview-name">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span>{imageFile.name}</span>
                          </div>
                          
                          <button 
                            type="button" 
                            className="create-quiz__image-preview-remove"
                            onClick={resetImageFile}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="create-quiz__button create-quiz__button--primary create-quiz__ai-submit"
                    disabled={aiGeneration.isLoading}
                  >
                    {aiGeneration.isLoading ? (
                      <>
                        <span className="create-quiz__ai-spinner"></span>
                        Генерация...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                          <path d="m15.5 9-5 5-3-3"></path>
                        </svg>
                        Сгенерировать квиз
                      </>
                    )}
                  </button>
                </form>
                
                <div className="create-quiz__ai-tips">
                  <h4 className="create-quiz__ai-tips-title">Советы:</h4>
                  <ul className="create-quiz__ai-tips-list">
                    {aiGenerationMode === 'text' ? (
                      <>
                        <li>Используйте конкретные темы для лучших результатов</li>
                        <li>Оптимальное количество вопросов: 5-7</li>
                        <li>После генерации вы сможете отредактировать результат</li>
                      </>
                    ) : (
                      <>
                        <li>Используйте четкие изображения без размытия</li>
                        <li>Убедитесь, что текст на изображении разборчив</li>
                        <li>Лучшие результаты дают фото конспектов с ключевыми фактами</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <form className="create-quiz__form" onSubmit={handleSubmit}>
              <h2 className="create-quiz__form-title">Создание нового квиза</h2>
              
              {/* Основная информация о квизе */}
              <section className="create-quiz__section">
                <h3 className="create-quiz__section-title">Основная информация</h3>
                
                <div className="create-quiz__field">
                  <label htmlFor="title" className="create-quiz__label">Название квиза *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="create-quiz__input"
                    placeholder="Введите название квиза"
                    value={quizData.title}
                    onChange={handleQuizChange}
                    maxLength={100}
                    required
                  />
                </div>
                
                <div className="create-quiz__field">
                  <label htmlFor="description" className="create-quiz__label">Описание квиза *</label>
                  <textarea
                    id="description"
                    name="description"
                    className="create-quiz__textarea"
                    placeholder="Введите описание квиза"
                    value={quizData.description}
                    onChange={handleQuizChange}
                    maxLength={500}
                    required
                  ></textarea>
                </div>
              </section>
              
              {/* Вопросы */}
              <section className="create-quiz__section">
                <h3 className="create-quiz__section-title">Вопросы</h3>
                
                <div className="create-quiz__questions">
                  {quizData.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="create-quiz__question">
                      <div className="create-quiz__question-header">
                        <div className="create-quiz__question-number">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="17" x2="12" y2="17"></line>
                          </svg>
                          Вопрос {questionIndex + 1}
                        </div>
                        
                        <div className="create-quiz__question-actions">
                          <button 
                            type="button" 
                            className="create-quiz__question-button create-quiz__question-button--delete"
                            onClick={() => removeQuestion(questionIndex)}
                            disabled={quizData.questions.length <= 1}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="create-quiz__field">
                        <input
                          type="text"
                          className="create-quiz__input"
                          placeholder="Введите текст вопроса"
                          value={question.questionText}
                          onChange={(e) => handleQuestionTextChange(questionIndex, e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="create-quiz__options">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="create-quiz__option">
                            <input
                              type="text"
                              className="create-quiz__option-input"
                              placeholder={`Вариант ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                              required
                            />
                            
                            <label className="create-quiz__correct-toggle">
                              <input
                                type="checkbox"
                                className="create-quiz__option-checkbox"
                                checked={question.correctAnswers[optionIndex]}
                                onChange={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                              />
                              <span>Правильный</span>
                            </label>
                            
                            <button
                              type="button"
                              className="create-quiz__option-remove"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                              disabled={question.options.length <= 2}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          className="create-quiz__add-option"
                          onClick={() => addOption(questionIndex)}
                        >
                          <span className="create-quiz__add-option-icon">+</span>
                          Добавить вариант ответа
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  className="create-quiz__add-question"
                  onClick={addQuestion}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14"></path>
                    <path d="M5 12h14"></path>
                  </svg>
                  Добавить вопрос
                </button>
              </section>
              
              <div className="create-quiz__actions">
                <div className="create-quiz__actions-group">
                  <button
                    type="button"
                    className="create-quiz__button create-quiz__button--outline"
                    onClick={handleCancel}
                  >
                    Отмена
                  </button>
                </div>
                <div className="create-quiz__actions-group">
                  <button
                    type="submit"
                    className="create-quiz__button create-quiz__button--success"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="create-quiz__button-icon create-quiz__button-icon--loading"></span>
                    ) : (
                      <span className="create-quiz__button-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                    )}
                    Сохранить квиз
                  </button>
                </div>
              </div>
            </form>
          )}
          
          {/* Уведомление */}
          {notification.show && (
            <div className={`create-quiz__notification create-quiz__notification--${notification.type}`}>
              <div className="create-quiz__notification-icon">
                {notification.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                )}
              </div>
              <div className="create-quiz__notification-message">{notification.message}</div>
              <button 
                className="create-quiz__notification-close"
                onClick={closeNotification}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          )}
          
          {/* Индикатор загрузки */}
          {loading && (
            <div className="create-quiz__loading">
              <div className="create-quiz__spinner"></div>
              <div className="create-quiz__loading-text">Создание квиза...</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateQuizPage; 