import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { VolumesRoute } from './VolumesRoute';

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

const volumesRoute = createRoute({
  component: VolumesRoute,
  getParentRoute: () => rootRoute,
  path: 'volumes',
});

const volumesIndexRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '/',
  validateSearch: (search: { page?: number; query?: string }) => {
    return {
      page: search.page,
      query: search.query,
    };
  },
}).lazy(() =>
  import('src/features/Volumes/VolumesLanding').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCreateRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Volumes/VolumeCreate').then(
    (m) => m.volumeCreateLazyRoute
  )
);

const volumeActionRoute = createRoute({
  beforeLoad: ({ params }) => {
    if (!(params.action in volumeAction)) {
      throw redirect({
        search: (prev) => ({
          page: prev.page,
          query: prev.query,
        }),
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
  import('src/features/Volumes/VolumesLanding').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCatchAllRoute = createRoute({
  beforeLoad: () => {
    throw redirect({
      search: (prev) => ({
        page: prev.page,
        query: prev.query,
      }),
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
