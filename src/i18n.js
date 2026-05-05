import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ni18nConfig } from './ni18n.config';

// Import translations directly or use a backend
import enCommon from '../public/locales/en/common.json';
import arCommon from '../public/locales/ar/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      ar: { common: arCommon },
    },
    lng: 'en',
    fallbackLng: ni18nConfig.fallbackLng,
    ns: ni18nConfig.ns,
    defaultNS: ni18nConfig.defaultNS,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
