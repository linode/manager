import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { VolumesRoot } from './VolumesRoot';

import type { TableSearchParams } from '../types';

const volumeAction = {
  attach: 'attach',
  clone: 'clone',
  delete: 'delete',
  detach: 'detach',
  details: 'details',
  edit: 'edit',
  'manage-tags': 'manage-tags',
  resize: 'resize',
  upgrade: 'upgrade',
} as const;

export type VolumeAction = (typeof volumeAction)[keyof typeof volumeAction];

export interface VolumesSearchParams extends TableSearchParams {
  query?: string;
}

const volumesRoute = createRoute({
  component: VolumesRoot,
  getParentRoute: () => rootRoute,
  path: 'volumes',
});

const volumeDetailsRoute = createRoute({
  getParentRoute: () => volumesRoute,
  parseParams: (params) => ({
    volumeId: Number(params.volumeId),
  }),
  // validateSearch: (search: VolumesSearchParams) => search,
  path: '$volumeId',
}).lazy(() =>
  import('src/features/Volumes/VolumeDetails/volumeLandingLazyRoute').then(
    (m) => m.volumeDetailsLazyRoute
  )
);

const volumeDetailsSummaryRoute = createRoute({
  getParentRoute: () => volumeDetailsRoute,
  path: 'summary',
});

const volumesIndexRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '/',
  validateSearch: (search: VolumesSearchParams) => search,
}).lazy(() =>
  import('src/features/Volumes/volumesLandingLazyRoute').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCreateRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Volumes/volumesCreateLazyRoute').then(
    (m) => m.volumeCreateLazyRoute
  )
);

type VolumeActionRouteParams<P = number | string> = {
  action: VolumeAction;
  volumeId: P;
};

const volumeActionRoute = createRoute({
  beforeLoad: async ({ params }) => {
    if (!(params.action in volumeAction)) {
      throw redirect({
        search: () => ({}),
        to: '/volumes',
      });
    }
  },
  getParentRoute: () => volumesRoute,
  params: {
    parse: ({ action, volumeId }: VolumeActionRouteParams<string>) => ({
      action,
      volumeId: Number(volumeId),
    }),
    stringify: ({ action, volumeId }: VolumeActionRouteParams<number>) => ({
      action,
      volumeId: String(volumeId),
    }),
  },
  path: '$volumeId/$action',
  validateSearch: (search: VolumesSearchParams) => search,
}).lazy(() =>
  import('src/features/Volumes/volumesLandingLazyRoute').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCatchAllRoute = createRoute({
  beforeLoad: () => {
    throw redirect({
      search: () => ({}),
      to: '/volumes',
    });
  },
  getParentRoute: () => volumesRoute,
  path: '*',
});

export const volumesRouteTree = volumesRoute.addChildren([
  volumesIndexRoute.addChildren([volumeActionRoute]),
  volumesCreateRoute,
  volumesCatchAllRoute,
  volumeDetailsRoute.addChildren([volumeDetailsSummaryRoute]),
]);
