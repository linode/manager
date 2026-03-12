import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { ReservedIpsRoute } from './reservedIpsRoute';

import type { TableSearchParams } from '../types';

export interface NodesSearchParams extends TableSearchParams {
  query?: string;
}

const reservedIpsRoute = createRoute({
  component: ReservedIpsRoute,
  getParentRoute: () => rootRoute,
  path: 'reserved-ips',
});

const reservedIpsIndexRoute = createRoute({
  getParentRoute: () => reservedIpsRoute,
  path: '/',
}).lazy(() =>
  import(
    'src/features/ReservedIps/ReservedIpsLanding/ReservedIpsLazyRoute'
  ).then((m) => m.reservedIpsLazyRoute)
);

export const reservedIpsRouteTree = reservedIpsRoute.addChildren([
  reservedIpsIndexRoute,
]);
