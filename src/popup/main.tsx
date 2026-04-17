import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@/styles/global.css';

// Chrome popup sizing can ignore CSS height in some cases; enforce it at runtime.
const POPUP_WIDTH = '440px';
const POPUP_HEIGHT = '600px';
document.documentElement.style.width = POPUP_WIDTH;
document.documentElement.style.height = POPUP_HEIGHT;
document.body.style.width = POPUP_WIDTH;
document.body.style.height = POPUP_HEIGHT;
document.body.style.minHeight = POPUP_HEIGHT;

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in popup.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
