import { AccountMaintenance } from '@linode/api-v4/lib/account';
import { Filter, Params, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const useAllAccountMaintenanceQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true
) => {
  return useQuery<AccountMaintenance[], FormattedAPIError[]>({
    ...accountQueries.maintenance._ctx.all(params, filter),
    ...queryPresets.longLived,
    enabled,
  });
};

export const useAccountMaintenanceQuery = (params: Params, filter: Filter) => {
  return useQuery<ResourcePage<AccountMaintenance>, FormattedAPIError[]>({
    ...accountQueries.maintenance._ctx.paginated(params, filter),
    keepPreviousData: true,
    refetchInterval: 20000,
    refetchOnWindowFocus: 'always',
  });
};
