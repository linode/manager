import { getCloudPulseMetricsAPI } from '@linode/api-v4';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  APIError,
  CloudPulseMetricsRequest,
  CloudPulseMetricsResponse,
} from '@linode/api-v4';

export const useCloudViewMetricsQuery = (
  serviceType: string,
  request: CloudPulseMetricsRequest,
  props: any,
  widgetProps: any,
  enabled: boolean | undefined,
  readApiEndpoint: string
) => {
  const queryClient = useQueryClient();
  return useQuery<CloudPulseMetricsResponse, APIError[]>(
    [request, widgetProps, serviceType, props.authToken], // querykey and dashboardId makes this uniquely identifiable
    () =>
      getCloudPulseMetricsAPI(
        props.authToken,
        readApiEndpoint,
        serviceType,
        request
      ),
    {
      enabled: !!enabled,
      onError(err: APIError[]) {
        if (err && err.length > 0 && err[0].reason == 'Token expired') {
          const currentJWEtokenCache: any = queryClient.getQueryData([
            'jwe-token',
            serviceType,
          ]);
          if (
            currentJWEtokenCache.token == props.authToken &&
            !queryClient.isFetching(['jwe-token', serviceType])
          ) {
            queryClient.invalidateQueries(['jwe-token', serviceType]);
          }
        }
      },
      refetchInterval: 120000,
      refetchOnWindowFocus: false,
      retry: 0,
    }
  );
};
