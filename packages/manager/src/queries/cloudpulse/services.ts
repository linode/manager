import {
  APIError,
  MetricDefinitions,
  getMetricDefinitionsByServiceType,
} from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

export const queryKey = 'cloudview-services';
export const serviceTypeKey = 'service-types';

export const useGetCloudViewMetricDefinitionsByServiceType = (
  serviceType: string,
  enabled: boolean
) => {
  return useQuery<MetricDefinitions, APIError[]>(
    [queryKey, serviceTypeKey, serviceType],
    () => getMetricDefinitionsByServiceType(serviceType),
    {
      enabled,
    }
  );
};
