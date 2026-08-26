import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import AuditorPage from '../pages/AuditorPage.jsx';
import HistoryPage from '../pages/HistoryPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import { getRoute, normalizePath } from './routeConfig.js';

const PAGE_COMPONENTS = {
  '/auditor': AuditorPage,
  '/history': HistoryPage,
  '/settings': SettingsPage,
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
  const route = getRoute(currentPath);

  const Page = PAGE_COMPONENTS[route.path] || AuditorPage;
  const pageProps = useMemo(() => ({ navigate, currentPath, route }), [currentPath, navigate, route]);

  return (
    <AppShell currentPath={currentPath} route={route} navigate={navigate}>
      <Page {...pageProps} />
    </AppShell>
  );
}

export default Router;
