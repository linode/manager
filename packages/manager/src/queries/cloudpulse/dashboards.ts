import { Dashboard, getDashboardById, getDashboards } from '@linode/api-v4';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';

export const queryKey = 'cloudpulse-dashboards';

export const dashboardQueries = createQueryKeys(queryKey, {
  dashboardById: (dashboardId: number, key: boolean | undefined) => ({
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
});

// Fetch the list of all the dashboard available
export const useCloudPulseDashboardsQuery = (enabled: boolean) => {
  return useQuery<ResourcePage<Dashboard>, APIError[]>({
    ...dashboardQueries.lists._ctx.allDashboards,
    enabled,
  });
};

export const useCloudPulseDashboardByIdQuery = (
  dashboardId: number | undefined,
  key: boolean | undefined
) => {
  return useQuery<Dashboard, APIError[]>({
    ...dashboardQueries.dashboardById(dashboardId!, key)._ctx.dashboard,
    enabled: dashboardId !== undefined,
  });
};
