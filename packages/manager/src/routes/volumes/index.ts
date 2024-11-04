import { createRoute, redirect } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';

import { volumeQueries } from 'src/queries/volumes/volumes';

import { rootRoute } from '../root';
import { buildXFilters } from '../utils/buildXFilters';
import {
  VOLUME_TABLE_DEFAULT_ORDER,
  VOLUME_TABLE_DEFAULT_ORDER_BY,
} from './constants';
import { VolumesRoot } from './VolumesRoot';

import type { TableSearchParams } from '../types';
import type { OrderDirection } from '../utils/buildXFilters';

const volumeAction = {
  attach: 'attach',
  clone: 'clone',
  delete: 'delete',
  detach: 'detach',
  details: 'details',
  edit: 'edit',
  resize: 'resize',
  upgrade: 'upgrade',
} as const;

type VolumeAction = typeof volumeAction[keyof typeof volumeAction];

export interface VolumesSearchParams extends TableSearchParams {
  query?: string;
}

interface BuildVolumeXFiltersParams {
  order: OrderDirection;
  orderBy: string | undefined;
  query?: string;
}

export const buildVolumeXFilters = ({
  order = VOLUME_TABLE_DEFAULT_ORDER,
  orderBy = VOLUME_TABLE_DEFAULT_ORDER_BY,
  query,
}: BuildVolumeXFiltersParams) =>
  buildXFilters({
    nonPaginationFilters: query
      ? {
          label: { '+contains': query },
        }
      : undefined,
    pagination: {
      order,
      orderBy,
    },
  });

const volumesRoute = createRoute({
  component: VolumesRoot,
  getParentRoute: () => rootRoute,
  path: 'volumes',
});

const volumesIndexRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '/',
  validateSearch: (search: VolumesSearchParams) => search,
}).lazy(() =>
  import('src/routes/volumes/volumesLazyRoutes').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCreateRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: 'create',
}).lazy(() =>
  import('./volumesLazyRoutes').then((m) => m.volumeCreateLazyRoute)
);

const volumeActionRoute = createRoute({
  beforeLoad: async ({ params }) => {
    if (!(params.action in volumeAction)) {
      throw redirect({
        search: () => ({}),
        to: '/volumes',
      });
    }
  },
  getParentRoute: () => volumesRoute,
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.fetchQuery(
        volumeQueries.volume(params.volumeId)
      );
    } catch {
      enqueueSnackbar('Volume not found', { variant: 'error' });
      throw redirect({
        search: () => ({}),
        to: '/volumes',
      });
    }
  },
  parseParams: ({
    action,
    volumeId,
  }: {
    action: VolumeAction;
    volumeId: string;
  }) => ({
    action,
    volumeId: Number(volumeId),
  }),
  path: '$volumeId/$action',
  validateSearch: (search: VolumesSearchParams) => search,
}).lazy(() =>
  import('src/routes/volumes/volumesLazyRoutes').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCatchAllRoute = createRoute({
  beforeLoad: () => {
    throw redirect({
      search: () => ({}),
      to: '/volumes',
    });
  },
  getParentRoute: () => volumesRoute,
  path: '*',
});

export const volumesRouteTree = volumesRoute.addChildren([
  volumesIndexRoute.addChildren([volumeActionRoute]),
  volumesCreateRoute,
  volumesCatchAllRoute,
]);
