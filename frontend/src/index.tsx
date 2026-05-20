import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { useUserStore } from './store/useUserStore';

// Initialize authentication on app start
useUserStore.getState().initializeAuth();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
