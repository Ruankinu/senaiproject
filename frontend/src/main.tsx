import React from 'react';
import ReactDOM from 'react-dom/client';
// Tipografia padrão e legível: Roboto (títulos, texto e números).
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './styles/global.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
