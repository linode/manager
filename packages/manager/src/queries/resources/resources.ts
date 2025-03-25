import { queryPresets, useProfile } from '@linode/queries';
import { useQuery } from '@tanstack/react-query';

import { resourcesQueries } from './queries';

import type { APIError, IamAccountResource } from '@linode/api-v4';

export const useAccountResources = () => {
  const { data: profile } = useProfile();

  return useQuery<IamAccountResource, APIError[]>({
    ...resourcesQueries.resources,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};
