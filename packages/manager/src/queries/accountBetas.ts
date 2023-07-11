import {
  AccountBeta,
  getAccountBetas,
  EnrollInBetaData,
  getAccountBeta,
  enrollInBeta,
} from '@linode/api-v4/lib/account';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';

export const queryKey = 'account-beta';

export const useAccountBetasQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<AccountBeta>, APIError[]>(
    [`${queryKey}-list`, params, filter],
    () => getAccountBetas(params, filter),
    {
      keepPreviousData: true,
    }
  );

export const useAccountBetaQuery = (id: string) =>
  useQuery<AccountBeta, APIError[]>([queryKey, id], () => getAccountBeta(id), {
    keepPreviousData: true,
  });

export const useCreateAccountBetaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], EnrollInBetaData>(
    (data) => {
      return enrollInBeta(data);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(`${queryKey}-list`);
      },
    }
  );
};
