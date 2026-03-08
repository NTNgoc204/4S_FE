import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enAuth from './locales/en/auth.json'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import viAuth from './locales/vi/auth.json'
import viCommon from './locales/vi/common.json'
import viHome from './locales/vi/home.json'

const supportedLanguages = ['en', 'vi']
const languageStorageKey = 'app_language'

const resources = {
  en: {
    auth: enAuth,
    common: enCommon,
    home: enHome,
  },
  vi: {
    auth: viAuth,
    common: viCommon,
    home: viHome,
  },
}

function detectInitialLanguage() {
  if (typeof window !== 'undefined') {
    const savedLanguage = window.localStorage.getItem(languageStorageKey)
    if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
      return savedLanguage
    }
  }

  return 'en'
}

i18n.use(initReactI18next).init({
  resources,
  ns: ['common', 'home', 'auth'],
  defaultNS: 'common',
  lng: detectInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (language) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(languageStorageKey, language)
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language
  }
})

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language
}

export default i18n
