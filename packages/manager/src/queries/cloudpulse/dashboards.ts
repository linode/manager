import {
  Dashboard,
  JWEToken,
  getDashboardById,
  getDashboards,
  getJWEToken,
} from '@linode/api-v4';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';

import type { JWETokenPayLoad } from '@linode/api-v4';

export const queryKey = 'cloudview-dashboards';

export const dashboardQueries = createQueryKeys('cloudview-dashboards', {
  dashboardById: (
    dashboardId: number | undefined,
    key: boolean | undefined
  ) => ({
    contextQueries: {
      dashboard: {
        queryFn: () => getDashboardById(dashboardId), // Todo: will be implemented later
        queryKey: [key, dashboardId],
      },
    },
    queryKey: [dashboardId],
  }),

  lists: {
    contextQueries: {
      allDashboards: {
        queryFn: getDashboards,
        queryKey: null,
      },
    },
    queryKey: null,
  },
  token: (key: string, serviceType: string) => ({
    contextQueries: {
      jweToken: (request: JWETokenPayLoad) => ({
        queryFn: () => getJWEToken(request, serviceType),
        queryKey: [key, serviceType],
      }),
    },
    queryKey: [key, serviceType],
  }),
});

// Fetch the list of all the dashboard available
export const useCloudViewDashboardsQuery = (enabled: boolean) => {
  return useQuery<ResourcePage<Dashboard>, APIError[]>({
    ...dashboardQueries.lists._ctx.allDashboards,
    enabled,
  });
};

export const useCloudViewDashboardByIdQuery = (
  dashboardId: number | undefined,
  key: boolean | undefined
) => {
  return useQuery<Dashboard, APIError[]>({
    ...dashboardQueries.dashboardById(dashboardId, key)._ctx.dashboard,
    enabled: dashboardId !== undefined,
  });
};

export const useCloudViewJWEtokenQuery = (
  serviceType: string,
  request: JWETokenPayLoad,
  runQuery: boolean
) => {
  return useQuery<JWEToken, APIError[]>({
    ...dashboardQueries.token('jwe-token', serviceType)._ctx.jweToken(request),
    enabled: runQuery,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};
