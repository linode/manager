import { getRoutes } from '@linode/api-v4/lib/aglb/routes';
import { useQuery } from 'react-query';
import { Route2 } from '@linode/api-v4/lib/aglb/types';

import type { APIError, ResourcePage } from '@linode/api-v4/lib/types';

export const queryKey = 'domains';

export const useRouteQuery = () =>
  useQuery<ResourcePage<Route2>, APIError[]>(
    [queryKey, 'paginated'],
    () => getRoutes(),
    { keepPreviousData: true }
  );
