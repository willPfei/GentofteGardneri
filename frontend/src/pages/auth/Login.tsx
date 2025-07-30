import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/auth.css';

interface StoredUser {
  email: string;
  password: string;
  name: string;
  organization: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Start login process
    setLoading(true);
    
    // Get stored users from localStorage
    const storedUsersJson = localStorage.getItem('ropa_users');
    const storedUsers: StoredUser[] = storedUsersJson ? JSON.parse(storedUsersJson) : [];
    
    // Find matching user
    const user = storedUsers.find(u => u.email === email && u.password === password);
    
    setTimeout(() => {
      setLoading(false);
      
      if (user) {
        // Store authentication state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
          email: user.email,
          name: user.name,
          organizationName: user.organization
        }));
        
        // Navigate to dashboard after successful login
        navigate('/dashboard', { state: { userName: user.name } });
      } else {
        setError('Invalid email or password');
      }
    }, 500);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign In</h1>
        <p className="auth-subtitle">Welcome back to RoPA Platform</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-input"
              required
              minLength={6}
            />
          </div>
          
          <div className="form-footer">
            <button 
              type="submit" 
              className="primary-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="form-helper">
              Don't have an account? <Link to="/register">Create Account</Link>
            </p>
          </div>
        </form>
        
        <div className="auth-footer">
          <button onClick={handleBackToHome} className="text-button">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
