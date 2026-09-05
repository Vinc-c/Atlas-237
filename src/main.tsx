import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import './index.css';

// Only report errors from the real deployed site, never from local dev —
// a dev server throwing errors while someone is actively coding isn't a
// production incident and would just add noise to the real signal.
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://cf1e6a5a625c0d32ab9138e1ff4efada@o4512032831045632.ingest.de.sentry.io/4512032839172176',
    environment: import.meta.env.MODE,
    // Deliberately no session replay / performance tracing enabled here —
    // those add real cost (Sentry quota) and capture more of what a user
    // was doing, which isn't needed just to catch and fix real bugs.
    // Add them later as a deliberate choice, not a default.
    tracesSampleRate: 0,
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>
);

function ErrorFallback() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Something went wrong</h1>
      <p style={{ color: '#64748b', maxWidth: '28rem' }}>
        We've been notified and are looking into it. Please try reloading the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{ padding: '0.625rem 1.25rem', borderRadius: '0.5rem', background: '#0176d3', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
      >
        Reload page
      </button>
    </div>
  );
}
