import { queryPresets } from '@linode/queries';
import { useQuery } from '@tanstack/react-query';

import { entitiesQueries } from './queries';

import type { AccountEntity, APIError, ResourcePage } from '@linode/api-v4';

export const useAccountEntities = () => {
  return useQuery<ResourcePage<AccountEntity>, APIError[]>({
    ...entitiesQueries.entities,
    ...queryPresets.shortLived,
  });
};
