import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function Auth() {
  const [isLogin, setIsLogin] = useState(false); // Default to signup so they enter their name
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLogin && !name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Name Required', text: 'Please enter your name.' });
      return;
    }
    if (!email.trim() || !password.trim()) {
      Swal.fire({ icon: 'warning', title: 'Fields Required', text: 'Please enter your email and password.' });
      return;
    }

    if (isLogin) {
      // Mock Login: use saved name, or extract from email if not found
      const savedName = localStorage.getItem('userName') || email.split('@')[0];
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', savedName);
      navigate('/library');
    } else {
      // Mock Signup: save name
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', name);
      navigate('/library');
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" style={{ position: 'absolute', top: '30px', left: '40px', textDecoration: 'none', fontFamily: 'Fraunces', fontSize: '1.5rem', color: 'var(--text-primary)' }}>Mia Librería.</Link>
      
      <div className="auth-card">
        <h2 className="serif">{isLogin ? 'Welcome Back' : 'Create Library'}</h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Your Name</label>
              <input 
                type="text" 
                placeholder="e.g. Mia" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.6 }}
              >
                {showPassword ? '👁️' : '🙈'}
              </span>
            </div>
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        
        <div className="toggle-text">
          {isLogin ? "Don't have a library yet? " : "Already have a library? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up here' : 'Log in here'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Auth;
