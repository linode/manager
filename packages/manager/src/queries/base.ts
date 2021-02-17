import { APIError } from '@linode/api-v4/lib/types';
import { QueryClient, UseMutationOptions, UseQueryOptions } from 'react-query';

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
    cacheTime: 10 * 60 * 1000
  },
  oneTimeFetch: {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    cacheTime: Infinity
  }
};

export const queryClient = new QueryClient({
  defaultOptions: { queries: queryPresets.longLived }
});

// =============================================================================
// Types
// =============================================================================
export type ItemsByID<T> = Record<string, T>;

// =============================================================================
// Utility Functions
// =============================================================================
export const listToItemsByID = <E extends {}[]>(
  entityList: E,
  indexer: string = 'id'
) => {
  return entityList.reduce(
    (map, item) => ({ ...map, [item[indexer]]: item }),
    {}
  );
};

export const mutationHandlers = <T, V, E = APIError[]>(
  queryKey: string,
  indexer: string = 'id'
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: (updatedEntity, variables) => {
      // Update the query data to include the newly updated Entity.
      queryClient.setQueryData<ItemsByID<T>>(queryKey, oldData => ({
        ...oldData,
        [variables[indexer]]: updatedEntity
      }));
    }
  };
};

export const creationHandlers = <T, V, E = APIError[]>(
  queryKey: string,
  indexer: string = 'id'
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: updatedEntity => {
      // Add the new Entity to the existing data.
      queryClient.setQueryData<ItemsByID<T>>(queryKey, oldData => ({
        ...oldData,
        [updatedEntity[indexer]]: updatedEntity
      }));
    }
  };
};

export const deletionHandlers = <T, V, E = APIError[]>(
  queryKey: string,
  indexer: string = 'id'
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: (_, variables) => {
      // Remove the Entity from the existing data.
      queryClient.setQueryData<ItemsByID<T>>(queryKey, oldData => {
        const oldDataCopy = { ...oldData };
        delete oldDataCopy[variables[indexer]];
        return oldDataCopy;
      });
    }
  };
};
