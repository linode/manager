import {
  AccountBeta,
  EnrollInBetaPayload,
  enrollInBeta,
  getAccountBeta,
  getAccountBetas,
} from '@linode/api-v4/lib/account';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export const queryKey = 'account-betas';

export const useAccountBetasQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<AccountBeta>, APIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getAccountBetas(params, filter),
    {
      keepPreviousData: true,
    }
  );

export const useAccountBetaQuery = (id: string) =>
  useQuery<AccountBeta, APIError[]>([queryKey, 'account-beta', id], () =>
    getAccountBeta(id)
  );

export const useCreateAccountBetaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], EnrollInBetaPayload>(
    (data) => {
      return enrollInBeta(data);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.invalidateQueries(['regions', 'paginated']);
      },
    }
  );
};
