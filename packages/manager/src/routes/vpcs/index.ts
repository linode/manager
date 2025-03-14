import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { VPCRoute } from './VPCRoute';

import type { TableSearchParams } from '../types';

export interface SubnetSearchParams extends TableSearchParams {
  query?: string;
}
const vpcAction = {
  delete: 'delete',
  edit: 'edit',
} as const;

const subnetAction = {
  assign: 'assign',
  create: 'create',
  delete: 'delete',
  edit: 'edit',
  unassign: 'unassign',
} as const;

const subnetLinodeAction = {
  powerOff: 'power-off',
  unassign: 'unassign',
};

export type VPCAction = typeof vpcAction[keyof typeof vpcAction];
export type SubnetAction = typeof subnetAction[keyof typeof subnetAction];
export type SubnetLinodeAction = typeof subnetLinodeAction[keyof typeof subnetLinodeAction];

const vpcsRoute = createRoute({
  component: VPCRoute,
  getParentRoute: () => rootRoute,
  path: 'vpcs',
});

const vpcsLandingRoute = createRoute({
  getParentRoute: () => vpcsRoute,
  path: '/',
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcLandingLazyRoute));

type VPCActionRouteParams<P = number | string> = {
  action: VPCAction;
  id: P;
};

const vpcActionRoute = createRoute({
  beforeLoad: async ({ params }) => {
    if (!(params.action in vpcAction)) {
      throw redirect({
        to: '/vpcs',
      });
    }
  },
  getParentRoute: () => vpcsLandingRoute,
  params: {
    parse: ({ action, id }: VPCActionRouteParams<string>) => ({
      action,
      id: Number(id),
    }),
    stringify: ({ action, id }: VPCActionRouteParams<number>) => ({
      action,
      id: String(id),
    }),
  },
  path: '$action/$id',
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcLandingLazyRoute));

const vpcsCreateRoute = createRoute({
  getParentRoute: () => vpcsRoute,
  path: 'create',
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcCreateLazyRoute));

const vpcsDetailRoute = createRoute({
  getParentRoute: () => vpcsRoute,
  path: '$vpcId',
  validateSearch: (search: SubnetSearchParams) => search,
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcDetailLazyRoute));

type SubnetActionRouteParams<P = number | string> = {
  action: SubnetAction;
  subnetId: P;
};

const subnetActionRoute = createRoute({
  beforeLoad: async ({ params }) => {
    if (!(params.action in subnetAction)) {
      throw redirect({
        params: {
          vpcId: params.vpcId,
        },
        search: () => ({}),
        to: `/vpcs/$vpcId`,
      });
    }
  },
  getParentRoute: () => vpcsDetailRoute,
  params: {
    parse: ({ action, subnetId }: SubnetActionRouteParams<string>) => ({
      action,
      subnetId: Number(subnetId),
    }),
    stringify: ({ action, subnetId }: SubnetActionRouteParams<number>) => ({
      action,
      subnetId: String(subnetId),
    }),
  },
  path: 'subnets/$subnetId/$action',
  validateSearch: (search: SubnetSearchParams) => search,
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcDetailLazyRoute));

type SubnetLinodeActionRouteParams<P = number | string> = {
  action: SubnetLinodeAction;
  linodeId: P;
};

const subnetLinodeActionRoute = createRoute({
  beforeLoad: async ({ params }) => {
    if (!(params.action in subnetLinodeAction)) {
      throw redirect({
        params: {
          vpcId: params.vpcId,
        },
        search: () => ({}),
        to: `/vpcs/$vpcId`,
      });
    }
  },
  getParentRoute: () => subnetActionRoute,
  params: {
    parse: ({ action, linodeId }: SubnetLinodeActionRouteParams<string>) => ({
      action,
      linodeId: Number(linodeId),
    }),
    stringify: ({
      action,
      linodeId,
    }: SubnetLinodeActionRouteParams<number>) => ({
      action,
      linodeId: String(linodeId),
    }),
  },
  path: '/linodes/$linodeId/$action',
  validateSearch: (search: SubnetSearchParams) => search,
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcDetailLazyRoute));

export const vpcsRouteTree = vpcsRoute.addChildren([
  vpcsLandingRoute.addChildren([vpcActionRoute]),
  vpcsCreateRoute,
  vpcsDetailRoute.addChildren([
    subnetActionRoute.addChildren([subnetLinodeActionRoute]),
  ]),
]);
