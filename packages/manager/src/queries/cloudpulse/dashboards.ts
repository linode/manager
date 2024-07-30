import { useQuery } from '@tanstack/react-query';

import { queryFactory } from './aclpQueryFacotry';

import type { Dashboard } from '@linode/api-v4';
import type { APIError, ResourcePage } from '@linode/api-v4/lib/types';

// Fetch the list of all the dashboard available
export const useCloudPulseDashboardsQuery = (enabled: boolean) => {
  return useQuery<ResourcePage<Dashboard>, APIError[]>({
    ...queryFactory.lists._ctx.dashboards,
    enabled,
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
