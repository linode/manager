import { useQueries, useQuery } from '@tanstack/react-query';

import { queryFactory } from './queries';

import type { Dashboard } from '@linode/api-v4';
import type { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import type { UseQueryOptions } from '@tanstack/react-query';

// Fetch the list of all the dashboard available
export const useCloudPulseDashboardsQuery = (serviceTypes: string[]) => {
  return useQueries({
    queries: serviceTypes.map<
      UseQueryOptions<ResourcePage<Dashboard>, APIError[]>
    >((serviceType) => ({
      ...queryFactory.lists._ctx.dashboards(serviceType),
      enabled: serviceTypes.length > 0,
      refetchOnWindowFocus: false,
      retry: 0,
    })),
  });
};

export const useCloudPulseDashboardByIdQuery = (
  dashboardId: number | undefined
) => {
  return useQuery<Dashboard, APIError[]>({
    ...queryFactory.dashboardById(dashboardId!),
    enabled: dashboardId !== undefined,
  });
};
