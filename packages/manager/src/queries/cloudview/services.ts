import {
  ServiceTypes,
  getCloudViewServiceTypes,
} from '@linode/api-v4/lib/cloudview';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

export const queryKey = 'cloudview-services';

export const useCloudViewServices = () => {
  return useQuery<ServiceTypes, APIError[]>(
    [queryKey, 'service-types'],
    () => getCloudViewServiceTypes(),
    {
      enabled: true,
    }
  );
};
