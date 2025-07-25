import { createRoute, redirect } from '@tanstack/react-router';

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
  appID?: number;
  backupID?: number;
  imageID?: string;
  linodeID?: number;
  stackScriptID?: number;
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

const linodeCatchAllRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: '$invalidPath',
  beforeLoad: ({ params }) => {
    if (
      ['migrate', 'rebuild', 'rescue', 'resize', 'upgrade'].includes(
        params.invalidPath
      )
    ) {
      throw redirect({
        to: '/linodes/$linodeId',
        params: { linodeId: params.linodeId },
        search: {
          [params.invalidPath]: true,
        },
      });
    }
  },
});

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
}).lazy(() =>
  import(
    'src/features/Linodes/LinodesDetail/LinodeNetworking/liondeNetworkingLazyRoute'
  ).then((m) => m.linodeNetworkingLazyRoute)
);

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
}).lazy(() =>
  import(
    'src/features/Linodes/LinodesDetail/LinodeStorage/linodeStorageLazyRoute'
  ).then((m) => m.linodeStorageLazyRoute)
);

const linodesDetailConfigurationsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'configurations',
}).lazy(() =>
  import(
    'src/features/Linodes/LinodesDetail/LinodeConfigs/linodeConfigsLazyRoute'
  ).then((m) => m.linodeConfigsLazyRoute)
);

const linodesDetailBackupsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'backup',
}).lazy(() =>
  import(
    'src/features/Linodes/LinodesDetail/LinodeBackup/linodeBackupsLazyRoute'
  ).then((m) => m.linodeBackupsLazyRoute)
);

const linodesDetailActivityRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'activity',
}).lazy(() =>
  import(
    'src/features/Linodes/LinodesDetail/LinodeActivity/linodeActivityLazyRoute'
  ).then((m) => m.linodeActivityLazyRoute)
);

const linodesDetailSettingsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'settings',
}).lazy(() =>
  import(
    'src/features/Linodes/LinodesDetail/LinodeSettings/linodeSettingsLazyRoute'
  ).then((m) => m.linodeSettingsLazyRoute)
);

const linodesDetailAlertsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'alerts',
}).lazy(() =>
  import(
    'src/features/Linodes/LinodesDetail/LinodeAlerts/linodeAlertsLazyRoute'
  ).then((m) => m.linodeAlertsLazyRoute)
);

const linodesDetailMetricsRoute = createRoute({
  getParentRoute: () => linodesDetailRoute,
  path: 'metrics',
}).lazy(() =>
  import(
    'src/features/Linodes/LinodesDetail/LinodeMetrics/linodeMetricsLazyRoute'
  ).then((m) => m.linodeMetricsLazyRoute)
);

const linodesDetailUpgradeInterfacesRoute = createRoute({
  getParentRoute: () => linodesDetailConfigurationsRoute,
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
    linodesDetailConfigurationsRoute.addChildren([
      linodesDetailUpgradeInterfacesRoute,
    ]),
    linodesDetailBackupsRoute,
    linodesDetailActivityRoute,
    linodesDetailSettingsRoute,
    linodesDetailAlertsRoute,
    linodesDetailMetricsRoute,
    linodeCatchAllRoute,
  ]),
]);
