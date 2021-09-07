import { AccountMaintenance } from '@linode/api-v4/lib/account';
import { getAccountMaintenance } from '@linode/api-v4/lib/account/maintenance';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryPresets } from './base';

export const queryKey = 'account-maintenance';

const getAllAccountMaintenance = (
  passedParams: any = {},
  passedFilter: any = {}
) =>
  getAll<AccountMaintenance>((params, filter) =>
    getAccountMaintenance(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((res) => res.data);

export const useAllAccountMaintenanceQuery = (
  params: any = {},
  filter: any = {},
  enabled: boolean = true
) => {
  return useQuery<AccountMaintenance[], APIError[]>(
    queryKey,
    () => getAllAccountMaintenance(params, filter),
    { ...queryPresets.longLived, enabled }
  );
};

export const useAccountMaintenanceQuery = (params: any, filter: any) => {
  return useQuery<ResourcePage<AccountMaintenance>, APIError[]>(
    [queryKey, params, filter],
    () => getAccountMaintenance(params, filter),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: 'always',
      refetchInterval: 20000,
    }
  );
};
