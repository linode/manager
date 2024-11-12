import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { LinodesRoute } from './LinodesRoute';

export const linodesRoute = createRoute({
  component: LinodesRoute,
  getParentRoute: () => rootRoute,
  path: 'linodes',
});

const linodesIndexRoute = createRoute({
  getParentRoute: () => linodesRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Linodes/index').then((m) => m.linodesLandingLazyRoute)
);

const linodesCreateRoute = createRoute({
  getParentRoute: () => linodesRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Linodes/LinodeCreate').then(
    (m) => m.linodeCreateLazyRoute
  )
);

const linodesDetailRoute = createRoute({
  getParentRoute: () => linodesRoute,
  parseParams: (params) => ({
    linodeId: Number(params.linodeId),
  }),
  path: '$linodeId',
}).lazy(() =>
  import('src/features/Linodes/LinodesDetail/LinodesDetail').then(
    (m) => m.linodeDetailLazyRoute
  )
);

const linodesDetailAnalyticsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'analytics',
}).lazy(() =>
  import('src/features/Linodes/LinodesDetail/LinodesDetail').then(
    (m) => m.linodeDetailLazyRoute
  )
);

const linodesDetailNetworkingRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'networking',
}).lazy(() =>
  import('src/features/Linodes/LinodesDetail/LinodesDetail').then(
    (m) => m.linodeDetailLazyRoute
  )
);

const linodesDetailStorageRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'storage',
}).lazy(() =>
  import('src/features/Linodes/LinodesDetail/LinodesDetail').then(
    (m) => m.linodeDetailLazyRoute
  )
);

const linodesDetailConfigurationsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'configurations',
}).lazy(() =>
  import('src/features/Linodes/LinodesDetail/LinodesDetail').then(
    (m) => m.linodeDetailLazyRoute
  )
);

const linodesDetailBackupsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'backup',
}).lazy(() =>
  import('src/features/Linodes/LinodesDetail/LinodesDetail').then(
    (m) => m.linodeDetailLazyRoute
  )
);

const linodesDetailActivityRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'activity',
}).lazy(() =>
  import('src/features/Linodes/LinodesDetail/LinodesDetail').then(
    (m) => m.linodeDetailLazyRoute
  )
);

const linodesDetailSettingsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'settings',
}).lazy(() =>
  import('src/features/Linodes/LinodesDetail/LinodesDetail').then(
    (m) => m.linodeDetailLazyRoute
  )
);

export const linodesRouteTree = linodesRoute.addChildren([
  linodesIndexRoute,
  linodesCreateRoute,
  linodesDetailRoute.addChildren([
    linodesDetailAnalyticsRoute,
    linodesDetailNetworkingRoute,
    linodesDetailStorageRoute,
    linodesDetailConfigurationsRoute,
    linodesDetailBackupsRoute,
    linodesDetailActivityRoute,
    linodesDetailSettingsRoute,
  ]),
]);
