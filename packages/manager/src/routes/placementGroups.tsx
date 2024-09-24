import {
  Outlet,
  createRoute,
  lazyRouteComponent,
} from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

export const AccountRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Placement Groups" />
      <ProductInformationBanner bannerLocation="Placement Groups" />
      <Outlet />
    </React.Suspense>
  );
};

export const placementGroupsRoute = createRoute({
  component: AccountRoutes,
  getParentRoute: () => rootRoute,
  path: 'placement-groups',
});

const placementGroupsIndexRoute = createRoute({
  component: lazyRouteComponent(() =>
    import(
      'src/features/PlacementGroups/PlacementGroupsLanding/PlacementGroupsLanding'
    ).then((module) => ({
      default: module.PlacementGroupsLanding,
    }))
  ),
  getParentRoute: () => placementGroupsRoute,
  path: '/',
});

const placementGroupsCreateRoute = createRoute({
  component: lazyRouteComponent(() =>
    import(
      'src/features/PlacementGroups/PlacementGroupsLanding/PlacementGroupsLanding'
    ).then((module) => ({
      default: module.PlacementGroupsLanding,
    }))
  ),
  getParentRoute: () => placementGroupsRoute,
  path: 'create',
});

const placementGroupsEditRoute = createRoute({
  component: lazyRouteComponent(() =>
    import(
      'src/features/PlacementGroups/PlacementGroupsLanding/PlacementGroupsLanding'
    ).then((module) => ({
      default: module.PlacementGroupsLanding,
    }))
  ),
  getParentRoute: () => placementGroupsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: 'edit/$id',
});

const placementGroupsDeleteRoute = createRoute({
  component: lazyRouteComponent(() =>
    import(
      'src/features/PlacementGroups/PlacementGroupsLanding/PlacementGroupsLanding'
    ).then((module) => ({
      default: module.PlacementGroupsLanding,
    }))
  ),
  getParentRoute: () => placementGroupsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: 'delete/$id',
});

const placementGroupsUnassignRoute = createRoute({
  component: lazyRouteComponent(() =>
    import(
      'src/features/PlacementGroups/PlacementGroupsDetail/PlacementGroupsDetail'
    ).then((module) => ({
      default: module.PlacementGroupsDetail,
    }))
  ),
  getParentRoute: () => placementGroupsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
    linodeId: Number(params.linodeId),
  }),
  path: '$id/unassign/$linodeId',
});

const placementGroupsDetailRoute = createRoute({
  component: lazyRouteComponent(() =>
    import(
      'src/features/PlacementGroups/PlacementGroupsDetail/PlacementGroupsDetail'
    ).then((module) => ({
      default: module.PlacementGroupsDetail,
    }))
  ),
  getParentRoute: () => placementGroupsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: '$id',
});

export const placementGroupsRouteTree = placementGroupsRoute.addChildren([
  placementGroupsIndexRoute,
  placementGroupsCreateRoute,
  placementGroupsEditRoute,
  placementGroupsDeleteRoute,
  placementGroupsDetailRoute,
  placementGroupsUnassignRoute,
]);
