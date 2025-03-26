import { IamAccountResource, APIError } from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';
import { useProfile } from 'src/queries/profile/profile';
import { queryPresets } from '../base';
import { resourcesQueries } from './queries';

export const useAccountResources = () => {
  const { data: profile } = useProfile();

  return useQuery<IamAccountResource, APIError[]>({
    ...resourcesQueries.resources,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};
