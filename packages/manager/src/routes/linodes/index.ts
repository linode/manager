import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { LinodesRoute } from './LinodesRoute';

import type { LinodeCreateType } from '@linode/utilities';
import type { StackScriptTabType } from 'src/features/Linodes/LinodeCreate/Tabs/StackScripts/utilities';

interface LinodeDetailSearchParams {
  delete?: boolean;
  migrate?: boolean;
  rebuild?: boolean;
  rescue?: boolean;
  resize?: boolean;
  selectedImageId?: string;
  upgrade?: boolean;
}

export interface LinodeCreateSearchParams {
  appID?: string;
  backupID?: string;
  imageID?: string;
  linodeID?: string;
  stackScriptID?: string;
  subtype?: StackScriptTabType;
  type?: LinodeCreateType;
}

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
  validateSearch: (search: LinodeCreateSearchParams) => search,
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
  validateSearch: (search: LinodeDetailSearchParams) => search,
  path: '$linodeId',
}).lazy(() =>
  import('src/features/Linodes/LinodesDetail/linodeDetailLazyRoute').then(
    (m) => m.linodeDetailLazyRoute
  )
);

const linodesDetailCloneRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'clone',
}).lazy(() =>
  import('src/features/Linodes/CloneLanding/cloneLandingLazyRoute').then(
    (m) => m.cloneLandingLazyRoute
  )
);

const linodesDetailCloneConfigsRoute = createRoute({
  getParentRoute: () => linodesDetailCloneRoute,
  path: 'configs',
});

const linodesDetailCloneDisksRoute = createRoute({
  getParentRoute: () => linodesDetailCloneRoute,
  path: 'disks',
});

const linodesDetailAnalyticsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'analytics',
});

const linodesDetailNetworkingRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'networking',
});

const linodesDetailNetworkingInterfacesRoute = createRoute({
  getParentRoute: () => linodesDetailNetworkingRoute,
  path: 'interfaces',
});

const linodesDetailNetworkingInterfacesDetailRoute = createRoute({
  getParentRoute: () => linodesDetailNetworkingInterfacesRoute,
  path: '$interfaceId',
  parseParams: (params) => ({
    interfaceId: Number(params.interfaceId),
  }),
});

const linodesDetailStorageRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'storage',
});

const linodesDetailConfigurationsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'configurations',
});

const linodesDetailBackupsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'backup',
});

const linodesDetailActivityRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'activity',
});

const linodesDetailSettingsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'settings',
});

const linodesDetailAlertsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'alerts',
});

const linodesDetailMetricsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'metrics',
});

const linodesDetailUpgradeInterfacesRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'upgrade-interfaces',
});

export const linodesRouteTree = linodesRoute.addChildren([
  linodesIndexRoute,
  linodesCreateRoute,
  linodesDetailRoute.addChildren([
    linodesDetailCloneRoute.addChildren([
      linodesDetailCloneConfigsRoute,
      linodesDetailCloneDisksRoute,
    ]),
    linodesDetailAnalyticsRoute,
    linodesDetailNetworkingRoute.addChildren([
      linodesDetailNetworkingInterfacesRoute,
      linodesDetailNetworkingInterfacesDetailRoute,
    ]),
    linodesDetailStorageRoute,
    linodesDetailConfigurationsRoute,
    linodesDetailBackupsRoute,
    linodesDetailActivityRoute,
    linodesDetailSettingsRoute,
    linodesDetailUpgradeInterfacesRoute,
    linodesDetailAlertsRoute,
    linodesDetailMetricsRoute,
  ]),
]);
