import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryFactory } from './queries';

import type {
  APIError,
  Filter,
  JWEToken,
  JWETokenPayLoad,
  MetricDefinition,
  ResourcePage,
  ServiceTypesList,
} from '@linode/api-v4';
import type { Params } from '@sentry/react/types/types';

export const useGetCloudPulseMetricDefinitionsByServiceType = (
  serviceType: string | undefined,
  enabled: boolean,
  params?: Params,
  filter?: Filter
) => {
  return useQuery<ResourcePage<MetricDefinition>, APIError[]>({
    ...queryFactory.metricsDefinitons(serviceType, params, filter),
    enabled,
  });
};

export const useCloudPulseJWEtokenQuery = (
  serviceType: string | undefined,
  request: JWETokenPayLoad,
  runQuery: boolean
) => {
  return useQuery<JWEToken, APIError[]>({
    ...queryFactory.token(serviceType, request),
    enabled: runQuery,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
};

export const useCloudPulseServiceTypes = (enabled: boolean) => {
  return useQuery<ServiceTypesList, APIError[]>({
    ...queryFactory.lists._ctx.serviceTypes,
    enabled,
  });
};
