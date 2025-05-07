import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

import type {
  AccountMaintenance,
  APIError,
  Filter,
  MaintenancePolicy,
  Params,
  ResourcePage,
} from '@linode/api-v4';

export const useAllAccountMaintenanceQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true,
) => {
  return useQuery<AccountMaintenance[], APIError[]>({
    ...accountQueries.maintenance._ctx.all(params, filter),
    ...queryPresets.longLived,
    enabled,
  });
};

export const useAccountMaintenanceQuery = (params: Params, filter: Filter) => {
  return useQuery<ResourcePage<AccountMaintenance>, APIError[]>({
    ...accountQueries.maintenance._ctx.paginated(params, filter),
    placeholderData: keepPreviousData,
    refetchInterval: 20000,
    refetchOnWindowFocus: 'always',
  });
};

export const useAccountMaintenancePoliciesQuery = () => {
  return useQuery<MaintenancePolicy[], APIError[]>(
    accountQueries.maintenance._ctx.policies,
  );
};
