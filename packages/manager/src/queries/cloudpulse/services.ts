import {
  type APIError,
  type Filter,
  type JWEToken,
  type JWETokenPayLoad,
  type MetricDefinition,
  type Params,
  type ResourcePage,
  type ServiceTypesList,
} from '@linode/api-v4';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryFactory } from './queries';

import type { Service } from '@linode/api-v4';

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

export const useCloudPulseServiceByType = (serviceType: null | string) => {
  return useQuery<Service, APIError[]>({
    ...queryFactory.serviceByType(serviceType ?? ''),
    enabled: Boolean(serviceType),
  });
};
