import { AccountMaintenance } from '@linode/api-v4/lib/account';
import { getAccountMaintenance } from '@linode/api-v4/lib/account/maintenance';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryPresets } from './base';

export const queryKey = 'account-maintenance';

const getAllAccountMaintenance = () =>
  getAll<AccountMaintenance>((passedParams, passedFilter) =>
    getAccountMaintenance(passedParams, passedFilter)
  )().then((res) => res.data);

export const useAllAccountMaintenanceQuery = () => {
  return useQuery<AccountMaintenance[], APIError[]>(
    queryKey,
    getAllAccountMaintenance,
    queryPresets.longLived
  );
};

export const useAccountMaintenanceQuery = (params: any, filter: any) => {
  return useQuery<ResourcePage<AccountMaintenance>, APIError[]>(
    [queryKey, params.page, params.page_size],
    () => getAccountMaintenance(params, filter),
    queryPresets.longLived
  );
};
