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
  import('src/features/Linodes/linodesLandingLazyRoute').then(
    (m) => m.linodesLandingLazyRoute
  )
);

const linodesCreateRoute = createRoute({
  getParentRoute: () => linodesRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Linodes/LinodeCreate/linodeCreateLazyRoute').then(
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
  import('src/features/Linodes/LinodesDetail/linodeDetailLazyRoute').then(
    (m) => m.linodeDetailLazyRoute
  )
);

const linodesDetailAnalyticsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'analytics',
})

const linodesDetailNetworkingRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'networking',
})

const linodesDetailStorageRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'storage',
})

const linodesDetailConfigurationsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'configurations',
})

const linodesDetailBackupsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'backup',
})

const linodesDetailActivityRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'activity',
})

const linodesDetailSettingsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'settings',
})

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
