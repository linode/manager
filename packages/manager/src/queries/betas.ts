import { Beta, getBeta, getBetas } from '@linode/api-v4/lib/betas';
import { Filter, Params, ResourcePage } from '@linode/api-v4/lib/types';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

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
  useQuery<ResourcePage<Beta>, FormattedAPIError[]>({
    ...betaQueries.paginated(params, filter),
    keepPreviousData: true,
  });

export const useBetaQuery = (id: string) =>
  useQuery<Beta, FormattedAPIError[]>(betaQueries.beta(id));
