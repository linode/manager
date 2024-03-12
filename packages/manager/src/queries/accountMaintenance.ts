import { AccountMaintenance } from '@linode/api-v4/lib/account';
import { getAccountMaintenance } from '@linode/api-v4/lib/account/maintenance';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';

export const queryKey = 'account-maintenance';

const getAllAccountMaintenance = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<AccountMaintenance>((params, filter) =>
    getAccountMaintenance(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((res) => res.data);

export const useAllAccountMaintenanceQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true
) => {
  return useQuery<AccountMaintenance[], APIError[]>(
    [queryKey, 'all', params, filter],
    () => getAllAccountMaintenance(params, filter),
    { ...queryPresets.longLived, enabled }
  );
};

export const useAccountMaintenanceQuery = (params: Params, filter: Filter) => {
  return useQuery<ResourcePage<AccountMaintenance>, APIError[]>(
    [queryKey, params, filter],
    () => getAccountMaintenance(params, filter),
    {
      keepPreviousData: true,
      refetchInterval: 20000,
      refetchOnWindowFocus: 'always',
    }
  );
};
