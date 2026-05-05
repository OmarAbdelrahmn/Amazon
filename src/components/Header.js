'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export default function Header() {
  const { t, i18n } = useTranslation('common');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lng', lng);
  };

  const navLinks = [
    { href: '/',           label: t('welcome'),   icon: '▲' },
    { href: '/employees',  label: t('employees'), icon: '◈' },
    { href: '/orders',     label: t('orders'),    icon: '◎' },
    { href: '/reports',    label: t('reports'),   icon: '▣' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  if (!mounted) return <header style={{ height: '60px', background: 'var(--secondary)' }} />;

  return (
    <header>
      <div className="hdr-inner container">
        {/* Logo */}
        <Link href="/" className="hdr-logo">
          <div className="hdr-logo-mark">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--primary)" />
              <path d="M8 10h16M8 16h10M8 22h13" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="hdr-logo-text">
            <span className="hdr-logo-brand">Amazon</span>
            <span className="hdr-logo-sub">Logistics</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hdr-nav">
          <ul>
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`hdr-nav-link ${pathname === link.href ? 'hdr-nav-link--active' : ''}`}
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
            >
              EN
            </button>
            <button
              className={`lang-btn ${i18n.language === 'ar' ? 'active' : ''}`}
              onClick={() => changeLanguage('ar')}
            >
              عربي
            </button>
          </div>

          <button className="hdr-logout" onClick={handleLogout} title="Sign out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        header {
          background: var(--secondary);
          height: 60px;
          display: flex;
          align-items: center;
        }

        .hdr-inner {
          display: flex;
          align-items: center;
          gap: 2rem;
          height: 100%;
        }

        /* Logo */
        .hdr-logo {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .hdr-logo-mark svg {
          width: 32px;
          height: 32px;
        }
        .hdr-logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }
        .hdr-logo-brand {
          font-family: var(--font-display);
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

        /* Nav */
        .hdr-nav {
          flex: 1;
        }
        .hdr-nav ul {
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
        .hdr-nav-link--active {
          color: var(--primary) !important;
          background: rgba(255,153,0,0.1) !important;
        }

        /* Actions */
        .hdr-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

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

        @media (max-width: 768px) {
          .hdr-logo-text { display: none; }
          .hdr-nav-link { padding: 0.4rem 0.6rem; font-size: 0.8rem; }
        }
      `}</style>
    </header>
  );
}