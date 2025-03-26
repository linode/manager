import { queryPresets, useProfile } from '@linode/queries';
import { useQuery } from '@tanstack/react-query';

import { entitiesQueries } from './queries';

import type { APIError, IamAccountEntities } from '@linode/api-v4';

export const useAccountEntities = () => {
  const { data: profile } = useProfile();

  return useQuery<IamAccountEntities, APIError[]>({
    ...entitiesQueries.entities,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};
