import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import HistoryPage from '../pages/HistoryPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import RecommendationsPage from '../pages/RecommendationsPage.jsx';
import ReportsPage from '../pages/ReportsPage.jsx';
import RulesPage from '../pages/RulesPage.jsx';
import ScannerPage from '../pages/ScannerPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import { getRoute, normalizePath } from './routeConfig.js';

const PAGE_COMPONENTS = {
  '/dashboard': DashboardPage,
  '/scanner': ScannerPage,
  '/reports': ReportsPage,
  '/history': HistoryPage,
  '/ai-recommendations': RecommendationsPage,
  '/rules': RulesPage,
  '/settings': SettingsPage,
  '/profile': ProfilePage,
  '/login': LoginPage,
};

function useHashRouter() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.hash));

  const navigate = useCallback((path) => {
    const nextPath = normalizePath(path);
    if (window.location.hash !== `#${nextPath}`) {
      window.location.hash = nextPath;
    } else {
      setCurrentPath(nextPath);
    }
  }, []);

  useEffect(() => {
    const syncRoute = () => setCurrentPath(normalizePath(window.location.hash));
    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  return { currentPath, navigate };
}

function Router() {
  const { currentPath, navigate } = useHashRouter();
  const { isAuthenticated } = useAuth();
  const route = getRoute(currentPath);

  useEffect(() => {
    if (route.protected && !isAuthenticated) {
      navigate('/login');
    }
    if (route.authOnly && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, route.authOnly, route.protected]);

  const Page = PAGE_COMPONENTS[route.path] || DashboardPage;
  const pageProps = useMemo(() => ({ navigate, currentPath, route }), [currentPath, navigate, route]);

  if (route.authOnly || (route.protected && !isAuthenticated)) {
    return <LoginPage {...pageProps} returnTo={route.protected ? currentPath : '/dashboard'} />;
  }

  return (
    <AppShell currentPath={currentPath} route={route} navigate={navigate}>
      <Page {...pageProps} />
    </AppShell>
  );
}

export default Router;
