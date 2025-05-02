import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import JoinPage from './components/JoinPage/JoinPage';
import AuthPage from './components/AuthPage/AuthPage';
import AdminPage from './components/AdminPage/AdminPage';
import QuizPage from './components/QuizPage/QuizPage';
import LobbyPage from './components/LobbyPage/LobbyPage';
import GamePage from './components/GamePage/GamePage';
import PlayQuizPage from './components/PlayQuizPage/PlayQuizPage';
import ResultsPage from './components/ResultsPage/ResultsPage';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';
import CreateQuizPage from './components/CreateQuizPage/CreateQuizPage';
import ProtectedRouteWithRedirect from './components/ProtectedRoute/ProtectedRouteWithRedirect';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Защищенные маршруты, требующие авторизации */}
            <Route path="/admin" element={
              <ProtectedRouteWithRedirect>
                <AdminPage />
              </ProtectedRouteWithRedirect>
            } />
            
            {/* Страница для просмотра квиза защищена */}
            <Route path="/quiz/:id" element={
              <ProtectedRouteWithRedirect>
                <QuizPage />
              </ProtectedRouteWithRedirect>
            } />
            
            {/* Страница для создания квиза защищена */}
            <Route path="/create-quiz" element={
              <ProtectedRouteWithRedirect>
                <CreateQuizPage />
              </ProtectedRouteWithRedirect>
            } />
            
            <Route path="/lobby/:id" element={<LobbyPage />} />
            <Route path="/game/:gameCode" element={<GamePage />} />
            <Route path="/play/:gameCode" element={<PlayQuizPage />} />
            <Route path="/results/:gameCode" element={<ResultsPage />} />
            
            {/* Маршрут для 404 страницы - должен быть последним */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
