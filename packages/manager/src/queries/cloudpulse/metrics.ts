import { useQuery, useQueryClient } from '@tanstack/react-query';
import Axios from 'axios';

import type {
  APIError,
  CloudPulseMetricsRequest,
  CloudPulseMetricsResponse,
} from '@linode/api-v4';
import type { AxiosRequestConfig } from 'axios';

const axiosInstance = Axios.create({});

export const useCloudPulseMetricsQuery = (
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
      fetchCloudPulseMetrics(
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

export const fetchCloudPulseMetrics = (
  token: string,
  readApiEndpoint: string,
  serviceType: string,
  requestData: CloudPulseMetricsRequest
) => {
  const config: AxiosRequestConfig = {
    data: requestData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
    url: `${readApiEndpoint}/${encodeURIComponent(serviceType!)}/metrics`,
  };

  return axiosInstance
    .request(config)
    .then((response) => response.data)
    .catch((error) => Promise.reject(error.response.data.errors));
};
