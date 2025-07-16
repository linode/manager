import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';

import type { TableSearchParams } from '../types';

export interface PlacementGroupsSearchParams extends TableSearchParams {
  action?: 'create' | 'delete' | 'edit';
  id?: number;
  query?: string;
}

export interface PlacementGroupLinodesSearchParams extends TableSearchParams {
  action?: 'assign' | 'unassign';
  linodeId?: number;
  query?: string;
}

const placementGroupsLandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/placement-groups',
  validateSearch: (search: PlacementGroupsSearchParams) => search,
}).lazy(() =>
  import(
    'src/features/PlacementGroups/PlacementGroupsLanding/placemenGroupsLandingLazyRoute'
  ).then((m) => m.placementGroupsLandingLazyRoute)
);

const placementGroupsDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: 'placement-groups/$id',
  validateSearch: (search: PlacementGroupLinodesSearchParams) => search,
}).lazy(() =>
  import(
    'src/features/PlacementGroups/PlacementGroupsDetail/placementGroupDetailLazyRoute'
  ).then((m) => m.placementGroupsDetailLazyRoute)
);

export const placementGroupsRouteTree = placementGroupsLandingRoute.addChildren(
  [placementGroupsDetailRoute]
);
