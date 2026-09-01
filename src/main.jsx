import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import './App.css';
import { CatalogProvider } from './state/CatalogContext.jsx';
import { ToastProvider } from './state/ToastContext.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <CatalogProvider>
          <App />
        </CatalogProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>
);
