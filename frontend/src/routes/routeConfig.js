export const ROUTES = [
  {
    path: '/auditor',
    label: 'Auditor',
    title: 'ML Auditor Command Center',
    subtitle: 'Static analysis scanner, pipeline health score, risk breakdown, and AI recommendations.',
    nav: true,
  },
  {
    path: '/history',
    label: 'Scan History',
    title: 'Scan History & Logs',
    subtitle: 'Review previous audit scores, severity breakdowns, and historical scan logs.',
    nav: true,
  },
  {
    path: '/settings',
    label: 'Settings',
    title: 'Workspace Settings',
    subtitle: 'Configure AI recommendation provider, OpenAI API key, and dark/light themes.',
    nav: true,
  },
];

export const NAV_ROUTES = ROUTES.filter((route) => route.nav);

export function normalizePath(hash) {
  const rawPath = (hash || '').replace(/^#/, '').trim();
  if (!rawPath || rawPath === '/' || rawPath === '/home' || rawPath === '/dashboard' || rawPath === '/scanner' || rawPath === '/reports' || rawPath === '/ai-recommendations' || rawPath === '/rules' || rawPath === '/profile' || rawPath === '/login') {
    return '/auditor';
  }
  return rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
}

export function getRoute(path) {
  return ROUTES.find((route) => route.path === path) || ROUTES[0];
}
