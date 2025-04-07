import { queryPresets, useProfile } from '@linode/queries';
import { useQuery } from '@tanstack/react-query';

import { entitiesQueries } from './queries';

import type { APIError, AccountEntity, ResourcePage } from '@linode/api-v4';

export const useAccountEntities = () => {
  const { data: profile } = useProfile();

  return useQuery<ResourcePage<AccountEntity>, APIError[]>({
    ...entitiesQueries.entities,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};
