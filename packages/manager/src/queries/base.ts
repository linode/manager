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
export type HasID = { id: number };
export type ItemsByID<T extends HasID> = Record<string, T>;

// =============================================================================
// Utility Functions
// =============================================================================
export const listToItemsByID = <E extends HasID[]>(entityList: E) => {
  return entityList.reduce((map, item) => ({ ...map, [item.id]: item }), {});
};

export const mutationHandlers = <
  T extends HasID,
  V extends HasID,
  E = APIError[]
>(
  queryKey: string
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: (updatedEntity, variables) => {
      // Update the query data to include the newly updated Entity.
      queryClient.setQueryData<ItemsByID<T>>(queryKey, oldData => ({
        ...oldData,
        [variables.id]: updatedEntity
      }));
    }
  };
};

export const creationHandlers = <T extends HasID, V, E = APIError[]>(
  queryKey: string
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: updatedEntity => {
      // Add the new Entity to the existing data.
      queryClient.setQueryData<ItemsByID<T>>(queryKey, oldData => ({
        ...oldData,
        [updatedEntity.id]: updatedEntity
      }));
    }
  };
};

export const deletionHandlers = <
  T extends HasID,
  V extends HasID,
  E = APIError[]
>(
  queryKey: string
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: (_, variables) => {
      // Remove the Entity from the existing data.
      queryClient.setQueryData<ItemsByID<T>>(queryKey, oldData => {
        const oldDataCopy = { ...oldData };
        delete oldDataCopy[variables.id];
        return oldDataCopy;
      });
    }
  };
};
