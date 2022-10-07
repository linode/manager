import { APIError } from '@linode/api-v4/lib/types';
import { QueryClient, UseMutationOptions, UseQueryOptions } from 'react-query';
import { isEmpty } from '@linode/api-v4/lib/request';

// =============================================================================
// Config
// =============================================================================
type QueryConfigTypes = 'shortLived' | 'longLived' | 'oneTimeFetch' | 'noRetry';

export const queryPresets: Record<QueryConfigTypes, UseQueryOptions<any>> = {
  shortLived: {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
  },
  longLived: {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  },
  oneTimeFetch: {
    staleTime: Infinity,
    cacheTime: Infinity,
  },
  noRetry: {
    retry: false,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: { queries: queryPresets.longLived },
});

// =============================================================================
// Types
// =============================================================================
export type ItemsByID<T> = Record<string, T>;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * "Indexers" for the following methods are included to handle
 * the case where an entity's primary key isn't "id." By
 * default, these methods will try to map Entity.id: Entity,
 * but consumers can override this to map over whatever value
 * is unique to that entity type. One example of this is Entity Transfers,
 * which have a unique primary key of "token."
 *
 */

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
      queryClient.setQueryData<ItemsByID<T>>(queryKey, (oldData) => ({
        ...oldData,
        [variables[indexer]]: updatedEntity,
      }));
    },
  };
};

export const simpleMutationHandlers = <T, V, E = APIError[]>(
  queryKey: string
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: (updatedEntity, variables: V) => {
      queryClient.setQueryData<T>(queryKey, (oldData: T) => ({
        ...oldData,
        ...(isEmpty(updatedEntity) ? variables : updatedEntity),
      }));
    },
  };
};

export const creationHandlers = <T, V, E = APIError[]>(
  queryKey: string,
  indexer: string = 'id'
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: (updatedEntity) => {
      // Add the new Entity to the existing data.
      queryClient.setQueryData<ItemsByID<T>>(queryKey, (oldData) => ({
        ...oldData,
        [updatedEntity[indexer]]: updatedEntity,
      }));
    },
  };
};

export const deletionHandlers = <T, V, E = APIError[]>(
  queryKey: string,
  indexer: string = 'id'
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: (_, variables) => {
      // Remove the Entity from the existing data.
      queryClient.setQueryData<ItemsByID<T>>(queryKey, (oldData) => {
        const oldDataCopy = { ...oldData };
        delete oldDataCopy[variables[indexer]];
        return oldDataCopy;
      });
    },
  };
};

export const itemInListMutationHandler = <
  T extends { id: number | string },
  V,
  E = APIError[]
>(
  queryKey: string
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: (updatedEntity, variables) => {
      queryClient.setQueryData<any[]>(queryKey, (oldData) => {
        if (!oldData) {
          return [];
        }

        const index = oldData?.findIndex(
          (item) => item.id === updatedEntity.id
        );

        if (index === -1) {
          return oldData;
        }

        const copy = [...oldData];

        copy[index] = updatedEntity;

        return copy;
      });
    },
  };
};

export const itemInListCreationHandler = <T, V, E = APIError[]>(
  queryKey: string
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: (createdEntity) => {
      queryClient.setQueryData<any[]>(queryKey, (oldData) => {
        if (!oldData) {
          return [];
        }

        oldData = [...oldData, createdEntity];

        return oldData;
      });
    },
  };
};

export const itemInListDeletionHandler = <
  T,
  V extends { id?: number | string },
  E = APIError[]
>(
  queryKey: string
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: (_, variables) => {
      queryClient.setQueryData<any[]>(queryKey, (oldData) => {
        if (!oldData) {
          return [];
        }

        const index = oldData?.findIndex((item) => item.id === variables.id);

        if (index === -1) {
          return oldData;
        }

        const copy = [...oldData];

        copy.splice(index, 1);

        return copy;
      });
    },
  };
};
