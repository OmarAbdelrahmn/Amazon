export const ni18nConfig = {
  supportedLngs: ['en', 'ar'],
  ns: ['common'],
  defaultNS: 'common',
  fallbackLng: 'en',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
}
