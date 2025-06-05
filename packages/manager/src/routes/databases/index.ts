import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { DatabasesRoute } from './DatabasesRoute';

import type { Engine } from '@linode/api-v4';

interface DatabaseParams {
  databaseId: number;
  engine: Engine;
}

const databasesRoute = createRoute({
  component: DatabasesRoute,
  getParentRoute: () => rootRoute,
  path: 'databases',
});

const databasesIndexRoute = createRoute({
  getParentRoute: () => databasesRoute,
  path: '/',
}).lazy(() =>
  import('./databasesLazyRoutes').then((m) => m.databaseLandingLazyRoute)
);

const databasesCreateRoute = createRoute({
  getParentRoute: () => databasesRoute,
  path: 'create',
}).lazy(() =>
  import('./databasesLazyRoutes').then((m) => m.databaseCreateLazyRoute)
);

const databasesDetailRoute = createRoute({
  getParentRoute: () => databasesRoute,
  params: {
    parse: ({
      databaseId,
      engine,
    }: DatabaseParams & { databaseId: string }) => ({
      databaseId: Number(databaseId),
      engine,
    }),
    stringify: ({ databaseId, engine }: DatabaseParams) => ({
      databaseId: String(databaseId),
      engine,
    }),
  },
  path: '$engine/$databaseId',
}).lazy(() =>
  import('./databasesLazyRoutes').then((m) => m.databaseDetailLazyRoute)
);

const databasesDetailSummaryRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'summary',
}).lazy(() =>
  import('./databasesLazyRoutes').then((m) => m.databaseDetailLazyRoute)
);

const databasesDetailBackupsRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'backups',
}).lazy(() =>
  import('./databasesLazyRoutes').then((m) => m.databaseDetailLazyRoute)
);

const databasesDetailResizeRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'resize',
}).lazy(() =>
  import('./databasesLazyRoutes').then((m) => m.databaseDetailLazyRoute)
);

const databasesDetailSettingsRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'settings',
}).lazy(() =>
  import('./databasesLazyRoutes').then((m) => m.databaseDetailLazyRoute)
);

const databasesDetailConfigsRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'configs',
}).lazy(() =>
  import('./databasesLazyRoutes').then((m) => m.databaseDetailLazyRoute)
);

const databasesDetailMetricsRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'metrics',
}).lazy(() =>
  import('./databasesLazyRoutes').then((m) => m.databaseDetailLazyRoute)
);

const databasesDetailAlertsRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'alerts',
}).lazy(() =>
  import('./databasesLazyRoutes').then((m) => m.databaseDetailLazyRoute)
);

export const databasesRouteTree = databasesRoute.addChildren([
  databasesIndexRoute,
  databasesCreateRoute,
  databasesDetailRoute.addChildren([
    databasesDetailSummaryRoute,
    databasesDetailBackupsRoute,
    databasesDetailResizeRoute,
    databasesDetailSettingsRoute,
    databasesDetailConfigsRoute,
    databasesDetailMetricsRoute,
    databasesDetailAlertsRoute,
  ]),
]);
