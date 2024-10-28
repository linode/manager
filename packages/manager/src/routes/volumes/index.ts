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
  resize: 'resize',
  upgrade: 'upgrade',
} as const;

type VolumeAction = typeof volumeAction[keyof typeof volumeAction];

export interface VolumesSearchParams extends TableSearchParams {
  query?: string;
}

export const setVolumesSearchParams = (prev: VolumesSearchParams) => ({
  query: prev.query,
});

const volumesRoute = createRoute({
  component: VolumesRoot,
  getParentRoute: () => rootRoute,
  path: 'volumes',
});

const volumesIndexRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '/',
  validateSearch: (search) => search.query,
}).lazy(() =>
  import('src/routes/volumes/volumesLazyRoutes').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCreateRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: 'create',
}).lazy(() =>
  import('./volumesLazyRoutes').then((m) => m.volumeCreateLazyRoute)
);

const volumeActionRoute = createRoute({
  beforeLoad: ({ params }) => {
    if (!(params.action in volumeAction)) {
      throw redirect({
        search: setVolumesSearchParams,
        to: '/volumes',
      });
    }
  },
  getParentRoute: () => volumesRoute,
  parseParams: ({
    action,
    volumeId,
  }: {
    action: VolumeAction;
    volumeId: string;
  }) => ({
    action,
    volumeId: Number(volumeId),
  }),
  path: '$volumeId/$action',
}).lazy(() =>
  import('src/routes/volumes/volumesLazyRoutes').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCatchAllRoute = createRoute({
  beforeLoad: () => {
    throw redirect({
      search: setVolumesSearchParams,
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
]);
