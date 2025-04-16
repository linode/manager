import { useQuery, useQueryClient } from '@tanstack/react-query';
import Axios from 'axios';
import { useEffect } from 'react';

import { queryFactory } from './queries';

import type {
  APIError,
  CloudPulseMetricsRequest,
  CloudPulseMetricsRequestV2,
  CloudPulseMetricsResponse,
  JWEToken,
} from '@linode/api-v4';
import type { AxiosRequestConfig } from 'axios';

const axiosInstance = Axios.create({});

export const useCloudPulseMetricsQuery = (
  serviceType: string,
  request: CloudPulseMetricsRequest | CloudPulseMetricsRequestV2,
  obj: {
    authToken?: string;
    isFlags: boolean;
    label: string;
    timeStamp: number | undefined;
    url: string;
  }
) => {
  const queryClient = useQueryClient();

  const query = useQuery<CloudPulseMetricsResponse, APIError[]>({
    ...queryFactory.metrics(
      obj.authToken ?? '',
      obj.url,
      serviceType,
      request,
      obj.timeStamp,
      obj.label
    ),

    enabled: !!obj.isFlags,
    refetchInterval: 120000,
    refetchOnWindowFocus: false,
    retry: 0,
  });

  useEffect(() => {
    if (
      query.error &&
      query.error.length > 0 &&
      query.error[0].reason == 'Token expired'
    ) {
      const currentJWEtokenCache:
        | JWEToken
        | undefined = queryClient.getQueryData(
        queryFactory.token(serviceType, { entity_ids: [] }).queryKey
      );
      if (currentJWEtokenCache?.token === obj.authToken) {
        queryClient.invalidateQueries(
          {
            queryKey: queryFactory.token(serviceType, { entity_ids: [] })
              .queryKey,
          },
          {
            cancelRefetch: true,
          }
        );
      }
    }
  }, [query.error]);

  return query;
};

export const fetchCloudPulseMetrics = (
  token: string,
  readApiEndpoint: string,
  serviceType: string,
  requestData: CloudPulseMetricsRequest | CloudPulseMetricsRequestV2
) => {
  const config: AxiosRequestConfig = {
    data: requestData,
    headers: {
      'Authentication-Type': 'jwe',
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
    url: `${readApiEndpoint}${encodeURIComponent(serviceType)}/metrics`,
  };

  return axiosInstance
    .request(config)
    .then((response) => response.data)
    .catch((error) => Promise.reject(error.response?.data?.errors));
};
