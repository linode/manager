import { Dashboard, getDashboards } from "@linode/api-v4";
import { APIError, ResourcePage } from "@linode/api-v4/lib/types";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";

export const queryKey = 'cloudview-dashboards';

export const dashboardQueries = createQueryKeys('cloudview-dashboards', {
  availability: {
    contextQueries: {
      dashboard: (dashboardId: number) => ({
        queryFn: () => { }, //Todo: Add its implementation once ready
        queryKey: [dashboardId],
      }),
    },
    queryKey: null
  },
  dashboards: {
    queryFn: getDashboards,
    queryKey: null
  }
});

export const useCloudViewDashboardsQuery = () => {
  return useQuery<ResourcePage<Dashboard>, APIError[]>({
    // querykey and dashboardId makes this uniquely identifiable
    ...dashboardQueries.dashboards,
    enabled: true

  }
  );
};