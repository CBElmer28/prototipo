import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { StoreProvider } from './store.jsx';
import { A11yProvider } from './a11y.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <A11yProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </A11yProvider>
  </HashRouter>
);
