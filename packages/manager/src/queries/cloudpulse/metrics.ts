import { useQuery, useQueryClient } from '@tanstack/react-query';
import Axios from 'axios';

import { queryFactory } from './queries';

import type {
  APIError,
  CloudPulseMetricsRequest,
  CloudPulseMetricsResponse,
  JWEToken,
} from '@linode/api-v4';
import type { AxiosRequestConfig } from 'axios';

const axiosInstance = Axios.create({});

export const useCloudPulseMetricsQuery = (
  serviceType: string,
  request: CloudPulseMetricsRequest,
  obj: {
    authToken: string;
    isFlags: boolean;
    label: string;
    timeStamp: number | undefined;
    url: string;
  }
) => {
  const queryClient = useQueryClient();
  return useQuery<CloudPulseMetricsResponse, APIError[]>({
    ...queryFactory.metrics(
      obj.authToken,
      obj.url,
      serviceType,
      request,
      obj.timeStamp,
      obj.label
    ),

    enabled: !!obj.isFlags,
    onError(err: APIError[]) {
      if (err && err.length > 0 && err[0].reason == 'Token expired') {
        const currentJWEtokenCache:
          | JWEToken
          | undefined = queryClient.getQueryData(
          queryFactory.token(serviceType, { resource_id: [] }).queryKey
        );
        if (currentJWEtokenCache?.token === obj.authToken) {
          queryClient.invalidateQueries(
            queryFactory.token(serviceType, { resource_id: [] }).queryKey,
            {},
            {
              cancelRefetch: true,
            }
          );
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
