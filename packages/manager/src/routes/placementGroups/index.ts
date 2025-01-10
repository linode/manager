import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { PlacementGroupsRoute } from './PlacementGroupsRoute';

import type { TableSearchParams } from '../types';

export interface PlacementGroupsSearchParams extends TableSearchParams {
  query?: string;
}

const placementGroupAction = {
  delete: 'delete',
  edit: 'edit',
} as const;

const placementGroupLinodeAction = {
  assign: 'assign',
  unassign: 'unassign',
} as const;

export type PlacementGroupAction = typeof placementGroupAction[keyof typeof placementGroupAction];
export type PlacementGroupLinodesAction = typeof placementGroupLinodeAction[keyof typeof placementGroupLinodeAction];

export const placementGroupsRoute = createRoute({
  component: PlacementGroupsRoute,
  getParentRoute: () => rootRoute,
  path: 'placement-groups',
});

const placementGroupsIndexRoute = createRoute({
  getParentRoute: () => placementGroupsRoute,
  path: '/',
  validateSearch: (search: PlacementGroupsSearchParams) => search,
}).lazy(() =>
  import('./placementGroupsLazyRoutes').then(
    (m) => m.placementGroupsLandingLazyRoute
  )
);

const placementGroupsCreateRoute = createRoute({
  getParentRoute: () => placementGroupsRoute,
  path: 'create',
}).lazy(() =>
  import('./placementGroupsLazyRoutes').then(
    (m) => m.placementGroupsLandingLazyRoute
  )
);

type PlacementGroupActionRouteParams<P = number | string> = {
  action: PlacementGroupAction;
  id: P;
};

const placementGroupActionRoute = createRoute({
  beforeLoad: async ({ params }) => {
    if (!(params.action in placementGroupAction)) {
      throw redirect({
        search: () => ({}),
        to: '/placement-groups',
      });
    }
  },
  getParentRoute: () => placementGroupsRoute,
  params: {
    parse: ({ action, id }: PlacementGroupActionRouteParams<string>) => ({
      action,
      id: Number(id),
    }),
    stringify: ({ action, id }: PlacementGroupActionRouteParams<number>) => ({
      action,
      id: String(id),
    }),
  },
  path: '$action/$id',
  validateSearch: (search: PlacementGroupsSearchParams) => search,
}).lazy(() =>
  import('./placementGroupsLazyRoutes').then(
    (m) => m.placementGroupsLandingLazyRoute
  )
);

const placementGroupsDetailRoute = createRoute({
  getParentRoute: () => placementGroupsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: '$id',
}).lazy(() =>
  import('./placementGroupsLazyRoutes').then(
    (m) => m.placementGroupsDetailLazyRoute
  )
);

type PlacementGroupLinodesActionRouteParams<P = number | string> = {
  action: PlacementGroupLinodesAction;
};

const placementGroupLinodesActionBaseRoute = createRoute({
  beforeLoad: async ({ params }) => {
    if (!(params.action in placementGroupLinodeAction)) {
      throw redirect({
        search: () => ({}),
        to: `/placement-groups/${params.id}`,
      });
    }
  },
  getParentRoute: () => placementGroupsDetailRoute,
  params: {
    parse: ({ action }: PlacementGroupLinodesActionRouteParams<string>) => ({
      action,
    }),
    stringify: ({
      action,
    }: PlacementGroupLinodesActionRouteParams<number>) => ({
      action,
    }),
  },
  path: 'linodes/$action',
  validateSearch: (search: PlacementGroupsSearchParams) => search,
}).lazy(() =>
  import('./placementGroupsLazyRoutes').then(
    (m) => m.placementGroupsDetailLazyRoute
  )
);

const placementGroupsUnassignRoute = createRoute({
  getParentRoute: () => placementGroupLinodesActionBaseRoute,
  parseParams: (params) => ({
    linodeId: Number(params.linodeId),
  }),
  path: '$linodeId',
}).lazy(() =>
  import('./placementGroupsLazyRoutes').then(
    (m) => m.placementGroupsDetailLazyRoute
  )
);

export const placementGroupsRouteTree = placementGroupsRoute.addChildren([
  placementGroupsIndexRoute.addChildren([placementGroupActionRoute]),
  placementGroupsCreateRoute,
  placementGroupsDetailRoute.addChildren([
    placementGroupLinodesActionBaseRoute.addChildren([
      placementGroupsUnassignRoute,
    ]),
  ]),
]);
