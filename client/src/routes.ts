/**
 * Every in-app path in one place. Import these instead of writing string literals, so a
 * path can be changed here alone rather than hunted through the components.
 */
export const ROUTES = {
  home: '/',
  schedule: '/graphic',
  price: '/price',
  about: '/about',
  calendar: '/calendar',
  login: '/login',
  register: '/register',
} as const;

/** Paths that are real pages, as opposed to home-page sections to scroll to. */
export const PAGE_PATHS: ReadonlySet<string> = new Set([
  ROUTES.calendar,
  ROUTES.login,
  ROUTES.register,
]);
