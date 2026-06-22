import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout.jsx';
import Home from './views/Home.jsx';
import Login from './views/Login.jsx';
import Profile from './views/Profile.jsx';
import Dashboard from './views/Dashboard.jsx';

const TOKEN_KEY = 'leakagelens_token';

const ROUTES = {
  '/': Home,
  '/home': Home,
  '/dashboard': Dashboard,
  '/scanner': Dashboard,
  '/reports': Dashboard,
  '/history': Dashboard,
  '/rules': Dashboard,
  '/ai-recommendations': Dashboard,
  '/profile': Profile,
  '/settings': Profile,
  '/login': Login,
};

const PROTECTED_ROUTES = new Set([
  '/dashboard',
  '/scanner',
  '/reports',
  '/history',
  '/rules',
  '/ai-recommendations',
  '/profile',
  '/settings',
]);

function normalizePath(hash) {
  const path = hash.replace(/^#/, '') || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [userToken, setUserToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const navigate = useCallback((path) => {
    window.location.hash = path;
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      const path = normalizePath(window.location.hash);
      setCurrentPath(path);
    };

    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  useEffect(() => {
    if (PROTECTED_ROUTES.has(currentPath) && !userToken) {
      navigate('/login');
    }
  }, [currentPath, userToken, navigate]);

  const handleLoginSuccess = useCallback(
    (token) => {
      localStorage.setItem(TOKEN_KEY, token);
      setUserToken(token);
      navigate('/dashboard');
    },
    [navigate],
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUserToken(null);
    navigate('/');
  }, [navigate]);

  const ViewComponent = ROUTES[currentPath] || Home;
  const isLoginPage = currentPath === '/login';

  if (isLoginPage) {
    return (
      <div className="app-login-shell">
        <Login onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />
      </div>
    );
  }

  return (
    <Layout
      currentPath={currentPath}
      userToken={userToken}
      onNavigate={navigate}
      onLogout={handleLogout}
    >
      <ViewComponent userToken={userToken} onNavigate={navigate} />
    </Layout>
  );
}

export default App;
