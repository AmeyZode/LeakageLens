export const ROUTES = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    title: 'Security Dashboard',
    subtitle: 'Pipeline health, issue severity, scan history, and AI guidance.',
    nav: true,
    protected: true,
  },
  {
    path: '/scanner',
    label: 'Scanner',
    title: 'Scanner Workspace',
    subtitle: 'Run static analysis against backend-accessible ML project paths.',
    nav: true,
    protected: true,
  },
  {
    path: '/reports',
    label: 'Reports',
    title: 'Reports',
    subtitle: 'Review Markdown and JSON audit output generated from the latest scan.',
    nav: true,
    protected: true,
  },
  {
    path: '/history',
    label: 'History',
    title: 'Scan History',
    subtitle: 'Track previous scan scores and severity counts from the backend history log.',
    nav: true,
    protected: true,
  },
  {
    path: '/ai-recommendations',
    label: 'AI',
    title: 'AI Recommendations',
    subtitle: 'Search, group, refresh, and copy fixes returned by the recommendation engine.',
    nav: true,
    protected: true,
  },
  {
    path: '/rules',
    label: 'Rules',
    title: 'Rule Engine',
    subtitle: 'Inspect the implemented LeakageLens rule registry and placeholder coverage.',
    nav: true,
    protected: true,
  },
  {
    path: '/settings',
    label: 'Settings',
    title: 'Settings',
    subtitle: 'Configure theme, AI provider, keys, and scanner preferences.',
    nav: true,
    protected: true,
  },
  {
    path: '/profile',
    label: 'Profile',
    title: 'Profile',
    subtitle: 'User identity and local workspace scan stats.',
    nav: false,
    protected: true,
  },
  {
    path: '/login',
    label: 'Login',
    title: 'Sign in',
    subtitle: 'Open your LeakageLens workspace.',
    nav: false,
    protected: false,
    authOnly: true,
  },
];

export const NAV_ROUTES = ROUTES.filter((route) => route.nav);

export function normalizePath(hash) {
  const path = (hash || '').replace(/^#/, '') || '/dashboard';
  if (path === '/' || path === '/home') return '/dashboard';
  return path.startsWith('/') ? path : `/${path}`;
}

export function getRoute(path) {
  return ROUTES.find((route) => route.path === path) || ROUTES[0];
}
