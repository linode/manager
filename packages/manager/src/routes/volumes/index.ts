import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { VolumesRoute } from './VolumesRoute';

const volumesRoute = createRoute({
  component: VolumesRoute,
  getParentRoute: () => rootRoute,
  path: 'volumes',
});

const volumesIndexRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '/',
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

export const volumesRouteTree = volumesRoute.addChildren([
  volumesIndexRoute,
  volumesCreateRoute,
]);
