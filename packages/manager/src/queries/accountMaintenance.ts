import { AccountMaintenance } from '@linode/api-v4/lib/account';
import { getAccountMaintenance } from '@linode/api-v4/lib/account/maintenance';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryPresets } from './base';

export const queryKey = 'account-maintenance';

const getAllAccountMaintenance = () =>
  getAll<AccountMaintenance>((passedParams, passedFilter) =>
    getAccountMaintenance(passedParams, passedFilter)
  )().then((res) => res.data);

export const useAccountMaintenanceQuery = () => {
  return useQuery<AccountMaintenance[], APIError[]>(
    queryKey,
    getAllAccountMaintenance,
    queryPresets.longLived
  );
};
