import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// basename='/admin': URL `/admin` sin slash → pathname relativo "" y rutas "/" no coinciden → pantalla en blanco.
if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
  const { pathname, search, hash } = window.location;
  window.history.replaceState({}, '', `${pathname}/${search}${hash}`);
}

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[admin]', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            padding: '2rem',
            maxWidth: 640,
            lineHeight: 1.5,
          }}
        >
          <h1 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Panel admin — error</h1>
          <p style={{ color: '#b91c1c' }}>{String(error?.message ?? error)}</p>
          <p style={{ opacity: 0.75, marginTop: '1rem' }}>
            Revisa la consola del navegador (F12) para el detalle. Si estás en local, asegúrate de ejecutar desde la raíz{' '}
            <code style={{ fontSize: '0.875em' }}>npm run dev</code>
            {' '}y abrir{' '}
            <code>http://127.0.0.1:5173/admin/</code>.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');

if (!rootEl) {
  document.body.innerHTML =
    '<p style="font-family:system-ui,sans-serif;padding:2rem;margin:0">Error: falta el elemento #root.</p>';
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </React.StrictMode>
  );
}
