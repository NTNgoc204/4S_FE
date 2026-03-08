import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import viCommon from './locales/vi/common.json'
import viHome from './locales/vi/home.json'

const supportedLanguages = ['en', 'vi']
const languageStorageKey = 'app_language'

const resources = {
  en: {
    common: enCommon,
    home: enHome,
  },
  vi: {
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

  if (typeof navigator !== 'undefined') {
    const browserLanguage = navigator.language?.toLowerCase() || ''
    if (browserLanguage.startsWith('vi')) {
      return 'vi'
    }
  }

  return 'en'
}

i18n.use(initReactI18next).init({
  resources,
  ns: ['common', 'home'],
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
