import { APIError } from '@linode/api-v4/lib/types';
import { QueryClient, UseMutationOptions, UseQueryOptions } from 'react-query';
import { Entity } from 'src/store/types';

// =============================================================================
// Config
// =============================================================================
type QueryConfigTypes = 'shortLived' | 'longLived' | 'oneTimeFetch';

export const queryPresets: Record<QueryConfigTypes, UseQueryOptions<any>> = {
  shortLived: {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    cacheTime: 5 * 60 * 1000
  },
  longLived: {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true
  },
  oneTimeFetch: {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    cacheTime: Infinity,
    keepPreviousData: true
  }
};

export const queryClient = new QueryClient({
  defaultOptions: { queries: queryPresets.longLived }
});

// =============================================================================
// Types
// =============================================================================
export type ItemsByID<T extends Entity> = Record<string, T>;

// =============================================================================
// Utility Functions
// =============================================================================
export const listToItemsByID = <E extends Entity[]>(entityList: E) => {
  return entityList.reduce((map, item) => ({ ...map, [item.id]: item }), {});
};

export const mutationHandlers = <T extends Entity, E = APIError[]>(
  queryKey: string,
  entityID: number
): UseMutationOptions<T, E, Partial<T>, () => void> => {
  return {
    onSuccess: updatedEntity => {
      // Update the query data to include the newly updated Entity.
      queryClient.setQueryData<ItemsByID<T>>(queryKey, oldData => ({
        ...oldData,
        [entityID]: updatedEntity
      }));
    }
  };
};
