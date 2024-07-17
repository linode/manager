import {
  APIError,
  JWEToken,
  MetricDefinitions,
  getJWEToken,
  getMetricDefinitionsByServiceType,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';

import type { JWETokenPayLoad } from '@linode/api-v4';

export const queryKey = 'cloudpulse-services';
export const serviceTypeKey = 'service-types';

const serviceQueries = createQueryKeys(queryKey, {
  metricsDefinitons: (serviceType: string | undefined) => ({
    queryFn: () => getMetricDefinitionsByServiceType(serviceType!),
    queryKey: [serviceType],
  }),
  token: (key: string, serviceType: string | undefined) => ({
    contextQueries: {
      jweToken: (request: JWETokenPayLoad) => ({
        queryFn: () => getJWEToken(request, serviceType!),
        queryKey: [key, serviceType],
      }),
    },
    queryKey: [key, serviceType],
  }),
});

export const useGetCloudPulseMetricDefinitionsByServiceType = (
  serviceType: string | undefined,
  enabled: boolean
) => {
  return useQuery<MetricDefinitions, APIError[]>({
    ...serviceQueries.metricsDefinitons(serviceType),
    enabled,
  });
};

export const useCloudPulseJWEtokenQuery = (
  serviceType: string | undefined,
  request: JWETokenPayLoad,
  runQuery: boolean
) => {
  return useQuery<JWEToken, APIError[]>({
    ...serviceQueries.token('jwe-token', serviceType)._ctx.jweToken(request),
    enabled: runQuery,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};
