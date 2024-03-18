import { Beta, getBetas, getBeta } from '@linode/api-v4/lib/betas';
import { useQuery } from '@tanstack/react-query';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';

export const queryKey = 'betas';

export const useBetasQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<Beta>, APIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getBetas(params, filter),
    {
      keepPreviousData: true,
    }
  );

export const useBetaQuery = (id: string) =>
  useQuery<Beta, APIError[]>([queryKey, 'beta', id], () => getBeta(id));
