import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { betaQueries } from './keys';

import type { Beta } from '@linode/api-v4/lib/betas';
import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';

export const useBetasQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<Beta>, APIError[]>({
    ...betaQueries.paginated(params, filter),
    placeholderData: keepPreviousData,
  });

export const useBetaQuery = (id: string, enabled: boolean = true) =>
  useQuery({
    ...betaQueries.beta(id),
    enabled,
  });
