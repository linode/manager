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
  powerAction: 'powerAction',
  unassign: 'unassign',
} as const;

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
  vpcId: P;
};

const vpcActionRouteParams = {
  params: {
    parse: ({ action, vpcId }: VPCActionRouteParams<string>) => ({
      action,
      vpcId: Number(vpcId),
    }),
    stringify: ({ action, vpcId }: VPCActionRouteParams<number>) => ({
      action,
      vpcId: String(vpcId),
    }),
  },
}

const vpcActionRoute = createRoute({
  ...vpcActionRouteParams,
  beforeLoad: async ({ params }) => {
    if (!(params.action in vpcAction)) {
      throw redirect({
        to: '/vpcs',
      });
    }
  },
  getParentRoute: () => vpcsLandingRoute,
  path: '$vpcId/$action',
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcLandingLazyRoute));

const vpcsCreateRoute = createRoute({
  getParentRoute: () => vpcsRoute,
  path: 'create',
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcCreateLazyRoute));

const vpcsDetailRoute = createRoute({
  getParentRoute: () => vpcsRoute,
  parseParams: (params) => ({
    vpcId: Number(params.vpcId),
  }),
  path: '$vpcId',
  validateSearch: (search: SubnetSearchParams) => search,
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcDetailLazyRoute));

const subnetCreateRoute = createRoute({
  getParentRoute: () => vpcsDetailRoute,
  path: 'subnets/create',
  validateSearch: (search: SubnetSearchParams) => search,
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcDetailLazyRoute));

const subnetDetailRoute = createRoute({
  getParentRoute: () => vpcsDetailRoute,
  parseParams: (params) => ({
    subnetId: Number(params.subnetId),
  }),
  path: 'subnets/$subnetId',
  validateSearch: (search: SubnetSearchParams) => search,
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcDetailLazyRoute));

const vpcDetailsActionRoute = createRoute({
  ...vpcActionRouteParams,
  beforeLoad: async ({ params }) => {
    if (!(params.action in vpcAction)) {
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
  path: 'details/$action',
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcDetailLazyRoute));

type SubnetActionRouteParams<P = number | string> = {
  subnetAction: SubnetAction;
  subnetId: P;
};

const subnetActionRoute = createRoute({
  beforeLoad: async ({ params }) => {
    if (!(params.subnetAction in subnetAction)) {
      throw redirect({
        params: {
          vpcId: params.vpcId,
        },
        search: () => ({}),
        to: `/vpcs/$vpcId`,
      });
    }
  },
  getParentRoute: () => subnetDetailRoute,
  params: {
    parse: ({ subnetAction }: SubnetActionRouteParams<string>) => ({
      subnetAction,
    }),
    stringify: ({ subnetAction }: SubnetActionRouteParams<number>) => ({
      subnetAction,
    }),
  },
  path: '$subnetAction',
  validateSearch: (search: SubnetSearchParams) => search,
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcDetailLazyRoute));

type SubnetLinodeActionRouteParams<P = number | string> = {
  linodeAction: SubnetLinodeAction;
  linodeId: P;
};

const subnetLinodeActionRoute = createRoute({
  beforeLoad: async ({ params }) => {
    if (!(params.linodeAction in subnetLinodeAction)) {
      throw redirect({
        params: {
          vpcId: params.vpcId,
        },
        search: () => ({}),
        to: `/vpcs/$vpcId`,
      });
    }
  },
  getParentRoute: () => subnetDetailRoute,
  params: {
    parse: ({
      linodeAction,
      linodeId,
    }: SubnetLinodeActionRouteParams<string>) => ({
      linodeAction,
      linodeId: Number(linodeId),
    }),
    stringify: ({
      linodeAction,
      linodeId,
    }: SubnetLinodeActionRouteParams<number>) => ({
      linodeAction,
      linodeId: String(linodeId),
    }),
  },
  path: '/linodes/$linodeId/$linodeAction',
  validateSearch: (search: SubnetSearchParams) => search,
}).lazy(() => import('./vpcsLazyRoutes').then((m) => m.vpcDetailLazyRoute));

export const vpcsRouteTree = vpcsRoute.addChildren([
  vpcsLandingRoute.addChildren([vpcActionRoute]),
  vpcsCreateRoute,
  vpcsDetailRoute.addChildren([
    vpcDetailsActionRoute,
    subnetCreateRoute,
    subnetDetailRoute.addChildren([subnetActionRoute, subnetLinodeActionRoute]),
  ]),
]);
