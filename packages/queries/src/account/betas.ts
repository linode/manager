import { enrollInBeta } from '@linode/api-v4/lib/account';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { regionQueries } from '../regions';
import { accountQueries } from './queries';

import type {
  AccountBeta,
  EnrollInBetaPayload,
} from '@linode/api-v4/lib/account';
import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';

export const useAccountBetasQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<AccountBeta>, APIError[]>({
    ...accountQueries.betas._ctx.paginated(params, filter),
    placeholderData: keepPreviousData,
  });

export const useCreateAccountBetaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], EnrollInBetaPayload>({
    mutationFn: enrollInBeta,
    onSuccess() {
      // Refetch the paginated list of account betas. If we just enrolled in a beta,
      // it will show up in account betas.
      queryClient.invalidateQueries({
        queryKey: accountQueries.betas._ctx.paginated._def,
      });
      // Refetch all regions data because enrolling in betas can enable new regions
      // or region capabilities.
      queryClient.invalidateQueries({
        queryKey: regionQueries._def,
      });
    },
  });
};

export const useAccountBetaQuery = (id: string, enabled: boolean = false) => {
  return useQuery<AccountBeta, APIError[]>({
    enabled,
    retry: false,
    ...accountQueries.betas._ctx.beta(id),
  });
};
