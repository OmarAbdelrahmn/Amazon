'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export default function Header() {
  const { t, i18n } = useTranslation('common');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lng', lng);
  };

  if (!mounted) return <header className="header-placeholder" />;

  return (
    <header>
      <div className="container flex-between">
        <Link href="/" className="logo">
          <h2>Amazon Logistics</h2>
        </Link>
        <nav>
          <ul>
            <li><Link href="/">{t('welcome')}</Link></li>
            <li><Link href="/employees">{t('employees')}</Link></li>
            <li><Link href="/orders">{t('orders')}</Link></li>
            <li><Link href="/reports">{t('reports')}</Link></li>
          </ul>
        </nav>
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
      </div>
    </header>
  );
}
