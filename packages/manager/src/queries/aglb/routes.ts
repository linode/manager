import { getRoutes } from '@linode/api-v4/lib/aglb/routes';
import { useQuery } from 'react-query';
import { Route } from '@linode/api-v4/lib/aglb/types';

import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';

export const queryKey = 'routes';

export const useRoutesQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<Route>, APIError[]>(
    [`${queryKey}-list`, 'paginated', params, filter],
    () => getRoutes(params, filter),
    { keepPreviousData: true }
  );
