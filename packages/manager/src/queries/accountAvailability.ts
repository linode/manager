import {
  AccountAvailability,
  getAccountAvailabilities,
  getAccountAvailability,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

import { getAll } from 'src/utilities/getAll';

const queryKey = 'account-availability';

export const useAccountAvailabilitiesQuery = (enabled: boolean = true) =>
  useQuery<AccountAvailability[], APIError[]>(
    queryKey,
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
