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
import { useQuery } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

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

export const useAccountAvailabilitiesQueryUnpaginated = (
  enabled: boolean = true
) =>
  useQuery<AccountAvailability[], APIError[]>(
    [queryKey, 'unpaginated'],
    getAllAccountAvailabilitiesRequest,
    { enabled, keepPreviousData: true }
  );

const getAllAccountAvailabilitiesRequest = () =>
  getAll<AccountAvailability>((params, filters) =>
    getAccountAvailabilities(params, filters)
  )().then((data) => data.data);

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
