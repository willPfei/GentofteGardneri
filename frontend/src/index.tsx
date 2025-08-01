import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Using type assertion to handle potential null
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
