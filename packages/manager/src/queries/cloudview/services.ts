import {
  MetricDefinitions,
  MonitorServiceType,
  ServiceTypes,
  getCloudViewServiceTypes,
  getMetricDefinitionsByServiceType,
  getMonitorServiceTypeInformationByServiceType,
} from '@linode/api-v4/lib/cloudview';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

export const queryKey = 'cloudview-services';
export const serviceTypeKey = 'service-types';

export const useCloudViewServices = () => {
  return useQuery<ServiceTypes, APIError[]>(
    [queryKey, serviceTypeKey],
    () => getCloudViewServiceTypes(),
    {
      enabled: true,
    }
  );
};

export const useGetCloudViewServicesByServiceType = (serviceType: string) => {
  return useQuery<MonitorServiceType, APIError[]>(
    [queryKey, serviceTypeKey, serviceType],
    () => getMonitorServiceTypeInformationByServiceType(serviceType),
    {
      enabled: true,
    }
  );
};

export const useGetCloudViewMetricDefinitionsByServiceType = (
  serviceType: string,
  enabled: boolean
) => {
  return useQuery<MetricDefinitions, APIError[]>(
    [queryKey, serviceTypeKey, serviceType],
    () => getMetricDefinitionsByServiceType(serviceType),
    {
      enabled: enabled,
    }
  );
};
