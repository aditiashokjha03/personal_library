import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Library from './pages/Library';
import Auth from './pages/Auth';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/library" element={
          <ProtectedRoute>
            <Library />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
