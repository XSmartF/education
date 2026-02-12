import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enApp from './locales/en/app.json';
import enNav from './locales/en/nav.json';
import enLanguage from './locales/en/language.json';
import enAuth from './locales/en/auth.json';
import enTodos from './locales/en/todos.json';
import enFiles from './locales/en/files.json';
import enNotFound from './locales/en/not-found.json';
import enErrors from './locales/en/errors.json';
import enCommon from './locales/en/common.json';
import enCourses from './locales/en/courses.json';
import enDecks from './locales/en/decks.json';
import enMarketplace from './locales/en/marketplace.json';
import enWallet from './locales/en/wallet.json';
import enReputation from './locales/en/reputation.json';
import viApp from './locales/vi/app.json';
import viNav from './locales/vi/nav.json';
import viLanguage from './locales/vi/language.json';
import viAuth from './locales/vi/auth.json';
import viTodos from './locales/vi/todos.json';
import viFiles from './locales/vi/files.json';
import viNotFound from './locales/vi/not-found.json';
import viErrors from './locales/vi/errors.json';
import viCommon from './locales/vi/common.json';
import viCourses from './locales/vi/courses.json';
import viDecks from './locales/vi/decks.json';
import viMarketplace from './locales/vi/marketplace.json';
import viWallet from './locales/vi/wallet.json';
import viReputation from './locales/vi/reputation.json';

const resources = {
  en: {
    app: enApp,
    nav: enNav,
    language: enLanguage,
    auth: enAuth,
    todos: enTodos,
    files: enFiles,
    notFound: enNotFound,
    errors: enErrors,
    common: enCommon,
    courses: enCourses,
    decks: enDecks,
    marketplace: enMarketplace,
    wallet: enWallet,
    reputation: enReputation,
  },
  vi: {
    app: viApp,
    nav: viNav,
    language: viLanguage,
    auth: viAuth,
    todos: viTodos,
    files: viFiles,
    notFound: viNotFound,
    errors: viErrors,
    common: viCommon,
    courses: viCourses,
    decks: viDecks,
    marketplace: viMarketplace,
    wallet: viWallet,
    reputation: viReputation,
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    ns: [
      'app',
      'nav',
      'language',
      'auth',
      'todos',
      'files',
      'notFound',
      'errors',
      'common',
      'courses',
      'decks',
      'marketplace',
      'wallet',
      'reputation',
    ],
    defaultNS: 'app',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
