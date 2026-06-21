import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enAuth from './locales/en/auth.json'
import enAbout from './locales/en/about.json'
import enConsultation from './locales/en/consultation.json'
import enCommon from './locales/en/common.json'
import enForSchools from './locales/en/forSchools.json'
import enHome from './locales/en/home.json'
import enPricing from './locales/en/pricing.json'
import enProfile from './locales/en/profile.json'
import enSignup from './locales/en/signup.json'
import enNotFound from './locales/en/notFound.json'
import enNotifications from './locales/en/notifications.json'
import enCheckout from './locales/en/checkout.json'
import enQuiz from './locales/en/quiz.json'
import enUniversity from './locales/en/university.json'
import enChat from './locales/en/chat.json'
import viAuth from './locales/vi/auth.json'
import viAbout from './locales/vi/about.json'
import viConsultation from './locales/vi/consultation.json'
import viCommon from './locales/vi/common.json'
import viForSchools from './locales/vi/forSchools.json'
import viHome from './locales/vi/home.json'
import viPricing from './locales/vi/pricing.json'
import viProfile from './locales/vi/profile.json'
import viSignup from './locales/vi/signup.json'
import viNotFound from './locales/vi/notFound.json'
import viNotifications from './locales/vi/notifications.json'
import viCheckout from './locales/vi/checkout.json'
import viQuiz from './locales/vi/quiz.json'
import viUniversity from './locales/vi/university.json'
import viChat from './locales/vi/chat.json'

const supportedLanguages = ['en', 'vi']
const languageStorageKey = 'app_language'

const resources = {
  en: {
    about: enAbout,
    auth: enAuth,
    consultation: enConsultation,
    common: enCommon,
    forSchools: enForSchools,
    home: enHome,
    notFound: enNotFound,
    pricing: enPricing,
    profile: enProfile,
    signup: enSignup,
    notifications: enNotifications,
    checkout: enCheckout,
    quiz: enQuiz,
    university: enUniversity,
    chat: enChat,
  },
  vi: {
    about: viAbout,
    auth: viAuth,
    consultation: viConsultation,
    common: viCommon,
    forSchools: viForSchools,
    home: viHome,
    notFound: viNotFound,
    pricing: viPricing,
    profile: viProfile,
    signup: viSignup,
    notifications: viNotifications,
    checkout: viCheckout,
    quiz: viQuiz,
    university: viUniversity,
    chat: viChat,
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
  ns: ['common', 'home', 'auth', 'pricing', 'consultation', 'forSchools', 'about', 'signup', 'profile', 'notFound', 'notifications', 'checkout', 'quiz', 'university', 'chat'],
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
