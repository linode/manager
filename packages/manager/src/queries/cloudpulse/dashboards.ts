import { getDashboardById, getDashboards } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';

import type { Dashboard } from '@linode/api-v4';
import type { APIError, ResourcePage } from '@linode/api-v4/lib/types';

export const queryKey = 'cloudpulse-dashboards';

export const dashboardQueries = createQueryKeys(queryKey, {
  dashboardById: (dashboardId: number) => ({
    contextQueries: {
      dashboard: {
        queryFn: () => getDashboardById(dashboardId),
        queryKey: [dashboardId],
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
});

// Fetch the list of all the dashboard available
export const useCloudPulseDashboardsQuery = (enabled: boolean) => {
  return useQuery<ResourcePage<Dashboard>, APIError[]>({
    ...dashboardQueries.lists._ctx.allDashboards,
    enabled,
  });
};

export const useCloudPulseDashboardByIdQuery = (
  dashboardId: number | undefined
) => {
  return useQuery<Dashboard, APIError[]>({
    ...dashboardQueries.dashboardById(dashboardId!)._ctx.dashboard,
    enabled: dashboardId !== undefined,
  });
};
