import { getBeta, getBetas } from '@linode/api-v4/lib/betas';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import type { Filter, Params } from '@linode/api-v4/lib/types';

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
