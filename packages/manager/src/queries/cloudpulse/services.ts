import { getCloudPulseServiceTypes } from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

import { queryFactory } from './queries';

import type {
  APIError,
  JWEToken,
  JWETokenPayLoad,
  MetricDefinitions,
  ServiceTypes,
} from '@linode/api-v4';

const queryKey = 'cloudpulse-services';
const serviceTypeKey = 'service-types';
export const useGetCloudPulseMetricDefinitionsByServiceType = (
  serviceType: string | undefined,
  enabled: boolean
) => {
  return useQuery<MetricDefinitions, APIError[]>({
    ...queryFactory.metricsDefinitons(serviceType),
    enabled,
  });
};

export const useCloudPulseServices = () => {
  return useQuery<ServiceTypes, APIError[]>(
    [queryKey, serviceTypeKey],
    () => getCloudPulseServiceTypes(),
    {
      enabled: true,
    }
  );
};
export const useCloudPulseJWEtokenQuery = (
  serviceType: string | undefined,
  request: JWETokenPayLoad,
  runQuery: boolean
) => {
  return useQuery<JWEToken, APIError[]>({
    ...queryFactory.token(serviceType, request),
    enabled: runQuery,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};
