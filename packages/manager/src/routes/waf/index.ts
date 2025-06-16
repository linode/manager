import { createRoute, redirect } from '@tanstack/react-router';

import { WafRoute } from 'src/routes/waf/WafRoute';

import { rootRoute } from '../root';

const wafRoute = createRoute({
  component: WafRoute,
  getParentRoute: () => rootRoute,
  path: 'waf',
});

const wafIndexRoute = createRoute({
  getParentRoute: () => wafRoute,
  path: '/',
}).lazy(() => import('./wafLazyRoutes').then((m) => m.wafLandingLazyRoute));

const wafCreateRoute = createRoute({
  getParentRoute: () => wafRoute,
  path: 'create',
}).lazy(() => import('./wafLazyRoutes').then((m) => m.wafCreateLazyRoute));

const wafDetailRoute = createRoute({
  getParentRoute: () => wafRoute,
  path: '$id',
}).lazy(() => import('./wafLazyRoutes').then((m) => m.wafDetailLazyRoute));

const wafDetailIndexRoute = createRoute({
  beforeLoad: async ({ params }) => {
    throw redirect({
      params: { id: params.id },
      to: '/waf/$id/overview',
    });
  },
  getParentRoute: () => wafDetailRoute,
  path: '/',
});

const wafDetailOverviewRoute = createRoute({
  getParentRoute: () => wafDetailRoute,
  path: 'overview',
}).lazy(() => import('./wafLazyRoutes').then((m) => m.wafDetailLazyRoute));

const wafDetailAnalyticsRoute = createRoute({
  getParentRoute: () => wafDetailRoute,
  path: 'analytics',
}).lazy(() => import('./wafLazyRoutes').then((m) => m.wafDetailLazyRoute));

const wafDetailSettingsRoute = createRoute({
  getParentRoute: () => wafDetailRoute,
  path: 'settings',
}).lazy(() => import('./wafLazyRoutes').then((m) => m.wafDetailLazyRoute));

const wafDetailLogsRoute = createRoute({
  getParentRoute: () => wafDetailRoute,
  path: 'logs',
}).lazy(() => import('./wafLazyRoutes').then((m) => m.wafDetailLazyRoute));

export const wafRouteTree = wafRoute.addChildren([
  wafIndexRoute,
  wafCreateRoute,
  wafDetailRoute.addChildren([
    wafDetailIndexRoute,
    wafDetailOverviewRoute,
    wafDetailAnalyticsRoute,
    wafDetailLogsRoute,
    wafDetailSettingsRoute,
  ]),
]);
