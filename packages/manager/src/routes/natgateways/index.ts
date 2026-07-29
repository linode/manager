import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { NATGatewaysRoute } from './natGatewaysRoute';

const natGatewaysRoute = createRoute({
  component: NATGatewaysRoute,
  getParentRoute: () => rootRoute,
  path: 'natgateways',
});

const natGatewaysIndexRoute = createRoute({
  getParentRoute: () => natGatewaysRoute,
  path: '/',
}).lazy(() =>
  import(
    'src/features/NATGateways/NATGatewaysLanding/NATGatewaysLazyRoute'
  ).then((m) => m.natGatewaysLazyRoute)
);

const natGatewaysCreateRoute = createRoute({
  getParentRoute: () => natGatewaysRoute,
  path: 'create',
}).lazy(() =>
  import(
    'src/features/NATGateways/NATGatewaysCreate/NATGatewaysCreateLazyRoute'
  ).then((m) => m.natGatewaysCreateLazyRoute)
);

export const natGatewaysRouteTree = natGatewaysRoute.addChildren([
  natGatewaysIndexRoute,
  natGatewaysCreateRoute,
]);
