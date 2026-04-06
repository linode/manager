import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { linodeQueries } from '../linodes/linodes';

import type { APIError, LinodeType } from '@linode/api-v4';
import type { UseQueryOptions } from '@tanstack/react-query';

export const useAllTypes = (enabled = true) => {
  return useQuery<LinodeType[], APIError[]>({
    ...linodeQueries.types._ctx.all,
    enabled,
    ...queryPresets.oneTimeFetch,
  });
};

/**
 * Some Linodes may have types that aren't returned by the /types and /types-legacy endpoints. This
 * hook may be useful in fetching these "shadow plans".
 *
 * Always returns an array of the same length of the `types` argument.
 */
export const useSpecificTypes = (types: string[], enabled = true) => {
  const queryClient = useQueryClient();

  return useQueries({
    queries: types.map<UseQueryOptions<LinodeType, APIError[]>>((type) => ({
      enabled: enabled && Boolean(type),
      ...linodeQueries.types._ctx.type(type),
      ...queryPresets.oneTimeFetch,
      initialData() {
        const allTypesFromCache = queryClient.getQueryData<LinodeType[]>(
          linodeQueries.types._ctx.all.queryKey,
        );

        return allTypesFromCache?.find((t) => t.id === type);
      },
    })),
  });
};

export const useTypeQuery = (type: string, enabled = true) => {
  return useSpecificTypes([type], enabled)[0];
};
