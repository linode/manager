import {
  AccountAvailability,
  getAccountAvailabilities,
  getAccountAvailability,
} from '@linode/api-v4/lib/account';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

const queryKey = 'account-availability';

export const useAccountAvailabilitiesQuery = (
  params: Params,
  filter: Filter,
  enabled: boolean = true
) => {
  return useQuery<ResourcePage<AccountAvailability>, APIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getAccountAvailabilities(params, filter),
    {
      enabled,
      keepPreviousData: true,
    }
  );
};

export const useAccountAvailabilityQuery = (
  id: string,
  enabled: boolean = true
) => {
  return useQuery<AccountAvailability, APIError[]>(
    [queryKey, 'accountAvailability', id],
    () => getAccountAvailability(id),
    {
      enabled,
    }
  );
};
