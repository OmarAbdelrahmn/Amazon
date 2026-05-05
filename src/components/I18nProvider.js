'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { useEffect, useState } from 'react';

export default function I18nProvider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check local storage for language preference
    const savedLng = localStorage.getItem('lng');
    if (savedLng && savedLng !== i18n.language) {
      i18n.changeLanguage(savedLng);
    }
    
    // Initial direction
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language || 'en';

    // Listen for language changes to update direction dynamically
    const handleLangChange = (lng) => {
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lng;
    };

    i18n.on('languageChanged', handleLangChange);

    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, []);

  if (!mounted) return <>{children}</>;

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
