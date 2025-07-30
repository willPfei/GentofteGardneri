import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/auth.css';

interface StoredUser {
  email: string;
  password: string;
  name: string;
  organization: string;
}

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword || !organization) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Get existing users or initialize empty array
    const storedUsersJson = localStorage.getItem('ropa_users');
    const storedUsers: StoredUser[] = storedUsersJson ? JSON.parse(storedUsersJson) : [];
    
    // Check if email already exists
    if (storedUsers.some(user => user.email === email)) {
      setError('An account with this email already exists');
      return;
    }
    
    // Add new user
    const newUser: StoredUser = {
      email,
      password,
      name,
      organization
    };
    
    storedUsers.push(newUser);
    
    // Save updated users array
    localStorage.setItem('ropa_users', JSON.stringify(storedUsers));
    
    // Set success state
    setSuccess(true);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleContinueToLogin = () => {
    navigate('/login');
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-success">
            <div className="success-icon">✓</div>
            <h2>Registration Successful!</h2>
            <p>Your account has been created. You can now log in to the RoPA Platform.</p>
            <button onClick={handleContinueToLogin} className="primary-button">
              Continue to Login
            </button>
            <button onClick={handleBackToHome} className="text-button" style={{ marginTop: '16px' }}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join RoPA Platform to manage your GDPR compliance</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="form-input"
              required
            />
          </div>
          
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
            <label htmlFor="organization">Organization</label>
            <input
              type="text"
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Your Company Ltd."
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
              placeholder="Minimum 8 characters"
              className="form-input"
              required
              minLength={8}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="form-input"
              required
              minLength={8}
            />
          </div>
          
          <div className="form-footer">
            <button type="submit" className="primary-button">
              Create Account
            </button>
            <p className="form-helper">
              Already have an account? <Link to="/login">Sign In</Link>
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

export default Register;
