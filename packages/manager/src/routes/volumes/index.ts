import { createRoute, redirect } from '@tanstack/react-router';
import Hello from 'volume_create/Hello';
import VolumeCreate from 'volume_create/VolumeCreate';

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

export type VolumeAction = typeof volumeAction[keyof typeof volumeAction];

export interface VolumesSearchParams extends TableSearchParams {
  query?: string;
}

const volumesRoute = createRoute({
  component: VolumesRoot,
  getParentRoute: () => rootRoute,
  path: 'volumes',
});

const volumesIndexRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '/',
  validateSearch: (search: VolumesSearchParams) => search,
}).lazy(() =>
  import('src/routes/volumes/volumesLazyRoutes').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCreateRoute = createRoute({
  component: VolumeCreate,
  getParentRoute: () => volumesRoute,
  path: 'create',
});

const volumesHelloRoute = createRoute({
  component: Hello,
  getParentRoute: () => volumesRoute,
  path: 'hello',
});

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
  import('src/routes/volumes/volumesLazyRoutes').then(
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
  volumesHelloRoute,
  volumesCatchAllRoute,
]);
