import React, { useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { usePromptLogStore } from '../store/usePromptLogStore';

const supabase = createClient();

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addNotification } = usePromptLogStore();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      addNotification('⚠️', 'Auth Error', error.message);
    } else {
      if (isSignUp) {
        addNotification('📧', 'Account Created', 'Please check your email or dashboard to confirm.');
      } else {
        addNotification('🔑', 'Welcome back', 'You have successfully signed in.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon" style={{ margin: '0 auto 1rem' }}>PL</div>
          <h1>{isSignUp ? 'Create Account' : 'Team Access'}</h1>
          <p>PromptLog Intelligence Hub</p>
        </div>

        <form onSubmit={handleAuth} className="login-form">
          <div className="form-group">
            <label>Team Email</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Processing...' : (isSignUp ? 'Create Team Account' : 'Sign In to Hub')}
          </button>
        </form>

        <div className="login-footer">
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ color: 'var(--purple-light)', marginBottom: '1rem' }}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
          <div>Internal Team Only • Secure Repository</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
