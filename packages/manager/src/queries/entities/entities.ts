import { queryPresets } from '@linode/queries';
import { useQuery } from '@tanstack/react-query';

import { entitiesQueries } from './queries';

import type {
  AccountEntity,
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4';

export const useAllAccountEntities = ({
  enabled = true,
  filter = {},
  params = {},
}) =>
  useQuery<AccountEntity[], APIError[]>({
    enabled,
    ...entitiesQueries.all(params, filter),
  });

export const useAccountEntities = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<AccountEntity>, APIError[]>({
    ...entitiesQueries.paginated(params, filter),
    ...queryPresets.shortLived,
  });
