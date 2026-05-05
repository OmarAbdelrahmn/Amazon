'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.login({ userName, password });
      
      // The API might return a raw string token or an object like { token: '...' }
      let token = '';
      if (typeof response === 'string') {
        token = response;
      } else if (response && response.token) {
        token = response.token;
      } else {
        // Fallback for demonstration if API isn't exactly matching
        console.warn('Unexpected response structure, stringifying as token', response);
        token = JSON.stringify(response); 
      }

      localStorage.setItem('auth_token', token);
      
      // Trigger a window reload or router push to initialize user session across the app
      window.location.href = '/'; 
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glass-card login-card animate-fade-in">
        <h2 className="login-title">Amazon Logistics</h2>
        <p className="login-subtitle">Sign in to your account</p>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              className="input-field" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: var(--background);
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 2.5rem;
        }
        .login-title {
          text-align: center;
          margin-bottom: 0.5rem;
          color: var(--text);
        }
        .login-subtitle {
          text-align: center;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }
        .w-full {
          width: 100%;
          justify-content: center;
          padding: 1rem;
        }
        .error-alert {
          background: rgba(186, 0, 13, 0.1);
          color: var(--error);
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
