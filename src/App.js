import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import JoinPage from './components/JoinPage/JoinPage';
import AuthPage from './components/AuthPage/AuthPage';
import AdminPage from './components/AdminPage/AdminPage';
import QuizPage from './components/QuizPage/QuizPage';
import LobbyPage from './components/LobbyPage/LobbyPage';
import GamePage from './components/GamePage/GamePage';
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
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/lobby/:id" element={<LobbyPage />} />
            <Route path="/game/:gameCode" element={<GamePage />} />
            <Route path="/play/:gameCode" element={<QuizPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
