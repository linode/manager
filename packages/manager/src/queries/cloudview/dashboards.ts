import {
  Dashboard,
  GetJWETokenPayload,
  JWEToken,
  getDashboardById,
  getDashboards,
  getJWEToken,
} from '@linode/api-v4';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

export const queryKey = 'cloudview-dashboards';

export const useCloudViewDashboardByIdQuery = (
  dashboardId: number | undefined
) => {
  return useQuery<Dashboard, APIError[]>(
    [queryKey, dashboardId], // querykey and dashboardId makes this uniquely identifiable
    () => getDashboardById(dashboardId!),
    {
      enabled: dashboardId != undefined,
    } // run this only if dashboarID is valid one
  );
};

export const useCloudViewDashboardsQuery = () => {
  return useQuery<ResourcePage<Dashboard>, APIError[]>(
    [queryKey], // querykey and dashboardId makes this uniquely identifiable
    () => getDashboards(),
    {
      enabled: true,
    } // run this only if dashboarID is valid one
  );
};

export const useCloudViewJWEtokenQuery = (
  serviceType: string,
  request: GetJWETokenPayload,
  runQuery: boolean
) => {
  return useQuery<JWEToken, APIError[]>(
    [queryKey, 'jwe-token', serviceType, request],
    () => getJWEToken(request, serviceType),
    {
      enabled: runQuery,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );
};
