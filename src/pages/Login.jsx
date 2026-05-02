import React, { useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { usePromptLogStore } from '../store/usePromptLogStore';

const supabase = createClient();

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addNotification } = usePromptLogStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase Key Defined:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

    if (error) {
      setError(error.message);
      addNotification('⚠️', 'Login Failed', error.message);
    } else {
      addNotification('🔑', 'Welcome back', 'You have successfully signed in.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon" style={{ margin: '0 auto 1rem' }}>PL</div>
          <h1>Team Access</h1>
          <p>PromptLog Intelligence Hub</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
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
            {loading ? 'Authenticating...' : 'Sign In to Hub'}
          </button>
        </form>

        <div className="login-footer">
          Internal Team Only • Secure Repository
        </div>
      </div>
    </div>
  );
};

export default Login;
