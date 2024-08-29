import { Beta, getBeta, getBetas } from '@linode/api-v4/lib/betas';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const betaQueries = createQueryKeys('betas', {
  beta: (id: string) => ({
    queryFn: () => getBeta(id),
    queryKey: [id],
  }),
  paginated: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getBetas(params, filter),
    queryKey: [params, filter],
  }),
});

export const useBetasQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<Beta>, APIError[]>({
    ...betaQueries.paginated(params, filter),
    placeholderData: keepPreviousData,
  });

export const useBetaQuery = (id: string) =>
  useQuery<Beta, APIError[]>(betaQueries.beta(id));
