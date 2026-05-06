'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export default function Header() {
  const { t, i18n } = useTranslation('common');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lng', lng);
  };

  const navLinks = [
    { href: '/', label: t('welcome'), icon: '▲' },
    { href: '/employees', label: t('employees'), icon: '◈' },
    { href: '/orders', label: t('orders'), icon: '◎' },
    { href: '/reports', label: t('reports'), icon: '▣' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  if (!mounted) return <header style={{ height: '80px', background: 'var(--secondary)' }} />;

  return (
    <header>
      <div className="hdr-inner container">
        {/* Logo */}
            <img src="/5.png" alt="Logo" style={{ width: '30px', height: '30px', borderRadius: '12px', objectFit: 'cover' }} />
          <div className="hdr-logo-text">
            <span className="hdr-logo-brand">Express</span>
            <span className="hdr-logo-sub">Service</span>
          </div>

        {/* Desktop Navigation */}
        <nav className="hdr-nav-desktop">
          <ul>
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`hdr-nav-link ${pathname === link.href ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right actions */}
        <div className="hdr-actions">
          <div className="lang-switch">
            <button
              className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
              onClick={() => changeLanguage('en')}
            >EN</button>
            <button
              className={`lang-btn ${i18n.language === 'ar' ? 'active' : ''}`}
              onClick={() => changeLanguage('ar')}
            >عربي</button>
          </div>

          <button className="hdr-logout" onClick={handleLogout} title="Sign out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="hdr-burger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span className={`hdr-burger-bar ${menuOpen ? 'open-1' : ''}`} />
            <span className={`hdr-burger-bar ${menuOpen ? 'open-2' : ''}`} />
            <span className={`hdr-burger-bar ${menuOpen ? 'open-3' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <nav className="hdr-mobile-nav" aria-label="Mobile navigation">
          <ul>
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`hdr-mobile-link ${pathname === link.href ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="hdr-mobile-icon">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <style jsx>{`
        header {
          background: var(--secondary);
          color: #fff;
          position: sticky;
          top: 0;
          height: 70px;
          z-index: 100;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .hdr-inner {
          display: flex;
          align-items: center;
          gap: 2rem;
          height: 60px;
        }

        /* ── Logo ── */
        .hdr-logo {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .hdr-logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }
        .hdr-logo-brand {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.01em;
        }
        .hdr-logo-sub {
          font-size: 0.68rem;
          color: var(--primary);
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* ── Desktop Nav ── */
        .hdr-nav-desktop { flex: 1; }
        .hdr-nav-desktop ul {
          list-style: none;
          display: flex;
          gap: 0.15rem;
          padding: 0;
          margin: 0;
        }
        .hdr-nav-link {
          display: block;
          padding: 0.45rem 0.875rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          border-radius: 6px;
          transition: all 0.18s ease;
          text-decoration: none;
          letter-spacing: 0.01em;
        }
        .hdr-nav-link:hover {
          color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.07);
        }
        .hdr-nav-link.active {
          color: #000 !important;
          background: var(--primary) !important;
          font-weight: 700 !important;
        }
        .hdr-nav-link.active:hover {
          background: var(--primary-hover) !important;
        }

        /* ── Actions ── */
        .hdr-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
          margin-left: auto;
        }
        .lang-switch { display: flex; gap: 0.4rem; }
        .lang-btn {
          padding: 0.3rem 0.65rem;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(255,255,255,0.65);
          transition: var(--transition);
          font-family: var(--font);
          cursor: pointer;
          background: none;
        }
        .lang-btn:hover { border-color: rgba(255,255,255,0.5); color: #fff; }
        .lang-btn.active { background: var(--primary); border-color: var(--primary); color: #000; }

        .hdr-logout {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .hdr-logout:hover {
          border-color: rgba(192,57,43,0.5);
          color: #e05a4e;
          background: rgba(192,57,43,0.08);
        }
        .hdr-logout svg { width: 15px; height: 15px; }

        /* ── Hamburger ── */
        .hdr-burger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent;
          cursor: pointer;
          padding: 0 8px;
          flex-shrink: 0;
        }
        .hdr-burger-bar {
          display: block;
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,0.7);
          border-radius: 2px;
          transition: all 0.22s ease;
          transform-origin: center;
        }
        .open-1 { transform: translateY(7px) rotate(45deg); }
        .open-2 { opacity: 0; transform: scaleX(0); }
        .open-3 { transform: translateY(-7px) rotate(-45deg); }

        /* ── Mobile drawer ── */
        .hdr-mobile-nav {
          background: var(--secondary);
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 0.5rem 0.75rem 0.85rem;
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hdr-mobile-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .hdr-mobile-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.8rem 1rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .hdr-mobile-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.07);
        }
        .hdr-mobile-link.active {
          color: #000 !important;
          background: var(--primary) !important;
          font-weight: 700 !important;
        }
        .hdr-mobile-link.active:hover {
          background: var(--primary-hover) !important;
        }
        .hdr-mobile-link.active .hdr-mobile-icon { opacity: 1; }
        .hdr-mobile-icon { font-size: 0.85rem; opacity: 0.7; }

        /* ── Mobile breakpoint ── */
        @media (max-width: 640px) {
          .hdr-inner { gap: 0.5rem; height: 56px; }
          .hdr-nav-desktop { display: none; }
          .hdr-burger { display: flex; }
          .lang-btn { padding: 0.25rem 0.45rem; font-size: 0.72rem; }
          .hdr-logout { width: 30px; height: 30px; }
          .hdr-logo-text { display: none; }
        }
        @media (min-width: 641px) {
          .hdr-mobile-nav { display: none !important; }
        }
      `}</style>
    </header>
  );
}