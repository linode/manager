import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { PlacementGroupsRoute } from './PlacementGroupsRoute';

export const placementGroupsRoute = createRoute({
  component: PlacementGroupsRoute,
  getParentRoute: () => rootRoute,
  path: 'placement-groups',
});

const placementGroupsIndexRoute = createRoute({
  getParentRoute: () => placementGroupsRoute,
  path: '/',
}).lazy(() =>
  import(
    'src/features/PlacementGroups/PlacementGroupsLanding/PlacementGroupsLanding'
  ).then((m) => m.placementGroupsLandingLazyRoute)
);

const placementGroupsCreateRoute = createRoute({
  getParentRoute: () => placementGroupsRoute,
  path: 'create',
}).lazy(() =>
  import(
    'src/features/PlacementGroups/PlacementGroupsLanding/PlacementGroupsLanding'
  ).then((m) => m.placementGroupsLandingLazyRoute)
);

const placementGroupsEditRoute = createRoute({
  getParentRoute: () => placementGroupsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: 'edit/$id',
}).lazy(() =>
  import(
    'src/features/PlacementGroups/PlacementGroupsLanding/PlacementGroupsLanding'
  ).then((m) => m.placementGroupsLandingLazyRoute)
);

const placementGroupsDeleteRoute = createRoute({
  getParentRoute: () => placementGroupsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: 'delete/$id',
}).lazy(() =>
  import(
    'src/features/PlacementGroups/PlacementGroupsLanding/PlacementGroupsLanding'
  ).then((m) => m.placementGroupsLandingLazyRoute)
);

const placementGroupsDetailRoute = createRoute({
  getParentRoute: () => placementGroupsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: '$id',
}).lazy(() =>
  import(
    'src/features/PlacementGroups/PlacementGroupsDetail/PlacementGroupsDetail'
  ).then((m) => m.placementGroupsDetailLazyRoute)
);

const placementGroupsDetailLinodesRoute = createRoute({
  getParentRoute: () => placementGroupsDetailRoute,
  path: 'linodes',
}).lazy(() =>
  import(
    'src/features/PlacementGroups/PlacementGroupsDetail/PlacementGroupsDetail'
  ).then((m) => m.placementGroupsDetailLazyRoute)
);

const placementGroupsAssignRoute = createRoute({
  getParentRoute: () => placementGroupsDetailLinodesRoute,
  path: 'assign',
}).lazy(() =>
  import(
    'src/features/PlacementGroups/PlacementGroupsDetail/PlacementGroupsDetail'
  ).then((m) => m.placementGroupsUnassignLazyRoute)
);

const placementGroupsUnassignRoute = createRoute({
  getParentRoute: () => placementGroupsDetailLinodesRoute,
  parseParams: (params) => ({
    linodeId: Number(params.linodeId),
  }),
  path: 'unassign/$linodeId',
}).lazy(() =>
  import(
    'src/features/PlacementGroups/PlacementGroupsDetail/PlacementGroupsDetail'
  ).then((m) => m.placementGroupsUnassignLazyRoute)
);

export const placementGroupsRouteTree = placementGroupsRoute.addChildren([
  placementGroupsIndexRoute,
  placementGroupsCreateRoute,
  placementGroupsEditRoute,
  placementGroupsDeleteRoute,
  placementGroupsDetailRoute.addChildren([
    placementGroupsDetailLinodesRoute,
    placementGroupsAssignRoute,
    placementGroupsUnassignRoute,
  ]),
]);
