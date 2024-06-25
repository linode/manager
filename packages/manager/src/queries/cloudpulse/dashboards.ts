import { Dashboard, getDashboards } from "@linode/api-v4";
import { APIError, ResourcePage } from "@linode/api-v4/lib/types";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";

export const queryKey = 'cloudview-dashboards';

export const dashboardQueries = createQueryKeys('cloudview-dashboards', {
  lists: {
    contextQueries: {
      allDashboards: {
        queryFn: getDashboards,
        queryKey: null
      }
    },
    queryKey: null
  },

  dashboardById: (dashboardId: number) => ({
    contextQueries: {
      dashboard: {
        queryFn: () => { }, //Todo: will be implemented later
        queryKey: [dashboardId]
      }
    },
    queryKey: [dashboardId]
  })

});

//Fetch the list of all the dashboard available
export const useCloudViewDashboardsQuery = (enabled: boolean) => {
  return useQuery<ResourcePage<Dashboard>, APIError[]>({
    ...dashboardQueries.lists._ctx.allDashboards,
    enabled
  });
};
