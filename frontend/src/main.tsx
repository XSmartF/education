import React from 'react';
import { createRoot } from 'react-dom/client';
import AppProviders from './app/providers/AppProviders';
import './shared/i18n';
import './styles/index.css';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <AppProviders />
  </React.StrictMode>
);
