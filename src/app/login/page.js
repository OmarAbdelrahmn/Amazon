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
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.login({ userName, password });
      
      let token = '';
      if (typeof response === 'string') {
        token = response;
      } else if (response && response.token) {
        token = response.token;
      } else {
        token = JSON.stringify(response);
      }

      localStorage.setItem('auth_token', token);
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">
      {/* Left panel — brand */}
      <div className="lp-brand">
        <div className="lp-brand-inner">
          <div className="lp-logo">
            <svg viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="var(--primary)" />
              <path d="M12 15h24M12 24h16M12 33h20" stroke="#000" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
            <div>
              <div className="lp-brand-name">Amazon</div>
              <div className="lp-brand-tagline">Logistics Dashboard</div>
            </div>
          </div>

          <div className="lp-brand-headline">
            <span className="lp-headline-word">Command</span>
            <span className="lp-headline-word lp-headline-word--accent">every</span>
            <span className="lp-headline-word">delivery.</span>
          </div>

          <p className="lp-brand-desc">
            Real-time order tracking, rider management, and performance analytics in one place.
          </p>

          <div className="lp-stats-row">
            <div className="lp-stat">
              <span className="lp-stat-val">99.8%</span>
              <span className="lp-stat-label">Uptime</span>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat">
              <span className="lp-stat-val">Live</span>
              <span className="lp-stat-label">Real-time sync</span>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat">
              <span className="lp-stat-val">AR / EN</span>
              <span className="lp-stat-label">Bilingual</span>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="lp-brand-bg">
          <div className="lp-orb lp-orb-1" />
          <div className="lp-orb lp-orb-2" />
          <div className="lp-grid" />
        </div>
      </div>

      {/* Right panel — form */}
      <div className="lp-form-panel">
        <div className="lp-form-card animate-fade-in">
          <div className="lp-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your operations account</p>
          </div>

          {error && (
            <div className="error-alert" style={{ marginBottom: '1.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="lp-field">
              <label>Username</label>
              <div className="lp-input-wrap">
                <svg className="lp-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  className="input-field lp-input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="lp-field">
              <label>Password</label>
              <div className="lp-input-wrap">
                <svg className="lp-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field lp-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lp-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary lp-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="lp-spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .lp-root {
          min-height: 100vh;
          display: flex;
          background: var(--secondary);
        }

        /* ── brand panel ── */
        .lp-brand {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          padding: 3rem;
          overflow: hidden;
        }

        .lp-brand-inner {
          position: relative;
          z-index: 2;
          max-width: 480px;
        }

        .lp-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 4rem;
        }
        .lp-logo svg { width: 48px; height: 48px; flex-shrink: 0; }
        .lp-brand-name {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.01em;
        }
        .lp-brand-tagline {
          font-size: 0.7rem;
          color: var(--primary);
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .lp-brand-headline {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .lp-headline-word {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: rgba(255,255,255,0.9);
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .lp-headline-word--accent {
          color: var(--primary);
        }

        .lp-brand-desc {
          font-size: 1rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
          margin-bottom: 3rem;
          max-width: 380px;
        }

        .lp-stats-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .lp-stat { display: flex; flex-direction: column; gap: 0.2rem; }
        .lp-stat-val {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
        }
        .lp-stat-label {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.4);
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .lp-stat-divider {
          width: 1px;
          height: 36px;
          background: rgba(255,255,255,0.1);
        }

        /* Brand background decoration */
        .lp-brand-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .lp-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }
        .lp-orb-1 {
          width: 400px;
          height: 400px;
          background: rgba(255,153,0,0.08);
          right: -100px;
          top: -100px;
        }
        .lp-orb-2 {
          width: 300px;
          height: 300px;
          background: rgba(3,105,161,0.06);
          left: -50px;
          bottom: 0px;
        }
        .lp-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* ── form panel ── */
        .lp-form-panel {
          width: 480px;
          flex-shrink: 0;
          background: var(--background);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 2rem;
        }

        .lp-form-card {
          width: 100%;
          max-width: 380px;
        }

        .lp-form-header {
          margin-bottom: 2.5rem;
        }
        .lp-form-header h2 {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 0.35rem;
          letter-spacing: -0.02em;
        }
        .lp-form-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .lp-field {
          margin-bottom: 1.25rem;
        }

        .lp-input-wrap {
          position: relative;
        }
        .lp-input-icon {
          position: absolute;
          left: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: var(--text-tertiary);
          pointer-events: none;
        }
        .lp-input {
          padding-left: 2.5rem;
          height: 46px;
        }
        .lp-eye-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-tertiary);
          display: flex;
          padding: 0.25rem;
          border-radius: 4px;
          transition: color 0.15s;
        }
        .lp-eye-btn:hover { color: var(--text-secondary); }
        .lp-eye-btn svg { width: 16px; height: 16px; }

        .lp-submit-btn {
          width: 100%;
          justify-content: center;
          height: 48px;
          font-size: 0.95rem;
          margin-top: 0.75rem;
          border-radius: var(--radius);
        }

        .lp-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .lp-root { flex-direction: column; }
          .lp-brand { padding: 3rem 2rem 2rem; min-height: 300px; }
          .lp-form-panel { width: 100%; }
          .lp-brand-headline { display: none; }
          .lp-logo { margin-bottom: 1rem; }
          .lp-brand-desc { display: none; }
          .lp-stats-row { display: none; }
        }
      `}</style>
    </div>
  );
}