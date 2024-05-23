import {
  APIError,
  CloudViewMetricsRequest,
  CloudViewMetricsResponse,
  getCloudViewMetrics,
  getCloudViewMetricsAPI,
} from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

import { queryKey } from '../preferences';

export const useCloudViewMetricsQuery = (
  serviceType: string,
  request: CloudViewMetricsRequest,
  props: any,
  widgetProps: any,
  enabled: boolean | undefined
) => {
  return useQuery<CloudViewMetricsResponse, APIError[]>(
    [request, widgetProps, serviceType], // querykey and dashboardId makes this uniquely identifiable
    () => getCloudViewMetricsAPI(props.authToken, serviceType, request),
    {
      enabled: !!enabled,
      refetchInterval: 60000,
      retry: 0,
    }
  );
};
