import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { getStoredThemeId, applyTheme } from './utils/themeService';
import { registerServiceWorker } from './utils/pwa';

applyTheme(getStoredThemeId());

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
