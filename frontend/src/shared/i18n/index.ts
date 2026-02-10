import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enApp from './locales/en/app.json';
import enNav from './locales/en/nav.json';
import enLanguage from './locales/en/language.json';
import enAuth from './locales/en/auth.json';
import enTodos from './locales/en/todos.json';
import enNotFound from './locales/en/not-found.json';
import enErrors from './locales/en/errors.json';
import viApp from './locales/vi/app.json';
import viNav from './locales/vi/nav.json';
import viLanguage from './locales/vi/language.json';
import viAuth from './locales/vi/auth.json';
import viTodos from './locales/vi/todos.json';
import viNotFound from './locales/vi/not-found.json';
import viErrors from './locales/vi/errors.json';

const resources = {
  en: {
    app: enApp,
    nav: enNav,
    language: enLanguage,
    auth: enAuth,
    todos: enTodos,
    notFound: enNotFound,
    errors: enErrors,
  },
  vi: {
    app: viApp,
    nav: viNav,
    language: viLanguage,
    auth: viAuth,
    todos: viTodos,
    notFound: viNotFound,
    errors: viErrors,
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    ns: ['app', 'nav', 'language', 'auth', 'todos', 'notFound', 'errors'],
    defaultNS: 'app',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;