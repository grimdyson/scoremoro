import '@ui/styles/tokens.css';
import '@ui/styles/reset.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element #root not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
