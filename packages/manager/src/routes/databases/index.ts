import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { DatabasesRoute } from './DatabasesRoute';

import type { Engine } from '@linode/api-v4';
import { mainContentRoute } from '../mainContent';

interface DatabaseParams {
  databaseId: number;
  engine: Engine;
}

const databasesRoute = createRoute({
  component: DatabasesRoute,
  getParentRoute: () => mainContentRoute,
  path: 'databases',
});

const databasesIndexRoute = createRoute({
  getParentRoute: () => databasesRoute,
  path: '/',
}).lazy(() =>
  import(
    'src/features/Databases/DatabaseLanding/databaseLandingLazyRoute'
  ).then((m) => m.databaseLandingLazyRoute)
);

const databasesCreateRoute = createRoute({
  getParentRoute: () => databasesRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Databases/DatabaseCreate/databaseCreateLazyRoute').then(
    (m) => m.databaseCreateLazyRoute
  )
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
  import('src/features/Databases/DatabaseDetail/databaseDetailLazyRoute').then(
    (m) => m.databaseDetailLazyRoute
  )
);

const databasesDetailSummaryRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'summary',
}).lazy(() =>
  import(
    'src/features/Databases/DatabaseDetail/DatabaseSummary/databaseSummaryLazyRoute'
  ).then((m) => m.databaseSummaryLazyRoute)
);

const databasesDetailBackupsRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'backups',
}).lazy(() =>
  import(
    'src/features/Databases/DatabaseDetail/DatabaseBackups/databaseBackupsLazyRoute'
  ).then((m) => m.databaseBackupsLazyRoute)
);

const databasesDetailResizeRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'resize',
}).lazy(() =>
  import(
    'src/features/Databases/DatabaseDetail/DatabaseResize/databaseResizeLazyRoute'
  ).then((m) => m.databaseResizeLazyRoute)
);

const databasesDetailSettingsRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'settings',
}).lazy(() =>
  import(
    'src/features/Databases/DatabaseDetail/DatabaseSettings/databaseSettingsLazyRoute'
  ).then((m) => m.databaseSettingsLazyRoute)
);

const databasesDetailConfigsRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'configs',
}).lazy(() =>
  import(
    'src/features/Databases/DatabaseDetail/DatabaseAdvancedConfiguration/databaseAdvancedConfigurationLazyRoute'
  ).then((m) => m.databaseAdvancedConfigurationLazyRoute)
);

const databasesDetailMetricsRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'metrics',
}).lazy(() =>
  import(
    'src/features/Databases/DatabaseDetail/DatabaseMonitor/databaseMonitorLazyRoute'
  ).then((m) => m.databaseMonitorLazyRoute)
);

const databasesDetailNetworkingRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'networking',
}).lazy(() =>
  import(
    'src/features/Databases/DatabaseDetail/DatabaseNetworking/databaseNetworkingLazyRoute'
  ).then((m) => m.databaseNetworkingLazyRoute)
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
    databasesDetailNetworkingRoute,
  ]),
]);
