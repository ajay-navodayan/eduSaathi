import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';

// Get saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('sathsikho_language') || 'en';

const resources = {
  en: {
    translation: translationEN
  },
  hi: {
    translation: translationHI
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, // the active language
    fallbackLng: 'en',  // fallback if key missing

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
