import { createRoute, redirect } from '@tanstack/react-router';
import { VolumesRoute } from './VolumesRoute';
import { rootRoute } from '../root';

const volumeAction = {
  attach: 'attach',
  detach: 'detach',
  edit: 'edit',
  resize: 'resize',
  clone: 'clone',
  upgrade: 'upgrade',
  delete: 'delete',
  details: 'details',
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
      // pageSize: search.pageSize ? Number(search.pageSize) : undefined,
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
        to: '/volumes',
        search: (prev) => ({
          page: prev.page,
          query: prev.query,
        }),
      });
    }
  },
  getParentRoute: () => volumesRoute,
  path: '$volumeId/$action',
  parseParams: ({
    volumeId,
    action,
  }: {
    volumeId: string;
    action: VolumeAction;
  }) => ({
    volumeId: Number(volumeId),
    action,
  }),
}).lazy(() =>
  import('src/features/Volumes/VolumesLanding').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCatchAllRoute = createRoute({
  beforeLoad: () => {
    throw redirect({
      to: '/volumes',
      search: (prev) => ({
        page: prev.page,
        query: prev.query,
      }),
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