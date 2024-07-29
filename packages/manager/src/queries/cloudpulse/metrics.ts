import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Axios from 'axios';

import type {
  APIError,
  CloudPulseMetricsRequest,
  CloudPulseMetricsResponse,
} from '@linode/api-v4';
import type { AxiosRequestConfig } from 'axios';

const queryKey = 'Cloudpulse-metrics';

const axiosInstance = Axios.create({});

const queryFactor = createQueryKeys(queryKey, {
  getMetrics: (
    token: string,
    readApiEndpoint: string,
    serviceType: string,
    requestData: CloudPulseMetricsRequest,
    key: string
  ) => ({
    queryFn: () =>
      fetchCloudPulseMetrics(token, readApiEndpoint, serviceType, requestData),
    queryKey: [key],
  }),
});

export const useCloudPulseMetricsQuery = (
  serviceType: string,
  request: CloudPulseMetricsRequest,
  obj: { authToken: string; isFlags: boolean; key: string; url: string }
) => {
  const queryClient = useQueryClient();
  return useQuery<CloudPulseMetricsResponse, APIError[]>({
    ...queryFactor.getMetrics(
      obj.authToken,
      obj.url,
      serviceType,
      request,
      obj.key
    ),

    enabled: !!obj.isFlags,
    onError(err: APIError[]) {
      if (err && err.length > 0 && err[0].reason == 'Token expired') {
        const currentJWEtokenCache: any = queryClient.getQueryData([
          'jwe-token',
          serviceType,
        ]);
        if (
          currentJWEtokenCache.token == obj.authToken &&
          !queryClient.isFetching(['jwe-token', serviceType])
        ) {
          queryClient.invalidateQueries(['jwe-token', serviceType]);
        }
      }
    },
    refetchInterval: 120000,
    refetchOnWindowFocus: false,
    retry: 0,
  });
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
    url: `${readApiEndpoint}${encodeURIComponent(serviceType!)}/metrics`,
  };

  return axiosInstance
    .request(config)
    .then((response) => response.data)
    .catch((error) => Promise.reject(error.response.data.errors));
};
