import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { VPCRoute } from './VPCRoute';

const vpcsRoute = createRoute({
  component: VPCRoute,
  getParentRoute: () => rootRoute,
  path: 'vpcs',
});

const vpcsLandingRoute = createRoute({
  getParentRoute: () => vpcsRoute,
  path: '/',
}).lazy(() =>
  import('src/features/VPCs/VPCLanding/VPCLanding').then(
    (m) => m.vpcLandingLazyRoute
  )
);

const vpcsCreateRoute = createRoute({
  getParentRoute: () => vpcsRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/VPCs/VPCCreate/VPCCreate').then(
    (m) => m.vpcCreateLazyRoute
  )
);

const vpcsDetailRoute = createRoute({
  getParentRoute: () => vpcsRoute,
  path: '$vpcId',
}).lazy(() =>
  import('src/features/VPCs/VPCDetail/VPCDetail').then(
    (m) => m.vpcDetailLazyRoute
  )
);

export const vpcsRouteTree = vpcsRoute.addChildren([
  vpcsLandingRoute,
  vpcsCreateRoute,
  vpcsDetailRoute,
]);
