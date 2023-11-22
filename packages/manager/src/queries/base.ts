import { isEmpty } from '@linode/api-v4/lib/request';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import {
  QueryClient,
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';

// =============================================================================
// Config
// =============================================================================
type QueryConfigTypes = 'longLived' | 'noRetry' | 'oneTimeFetch' | 'shortLived';

export const queryPresets: Record<QueryConfigTypes, UseQueryOptions<any>> = {
  longLived: {
    cacheTime: 10 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000,
  },
  noRetry: {
    retry: false,
  },
  oneTimeFetch: {
    cacheTime: Infinity,
    staleTime: Infinity,
  },
  shortLived: {
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  },
};

export const queryClientFactory = () => {
  return new QueryClient({
    defaultOptions: { queries: queryPresets.longLived },
  });
};

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
  indexer: string = 'id',
  queryClient: QueryClient
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
  queryKey: string,
  queryClient: QueryClient
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
  indexer: string = 'id',
  queryClient: QueryClient
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
  indexer: string = 'id',
  queryClient: QueryClient
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
  queryKey: QueryKey,
  queryClient: QueryClient
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
  queryKey: QueryKey,
  queryClient: QueryClient
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
  queryKey: QueryKey,
  queryClient: QueryClient
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

/**
 * Use this function when you wish to update one entity within paginated React Query data
 * @param queryKey The React Query queryKey prefix of paginated data (without the filters and page)
 * @param id the id of the entity of you want to update within this paginated data
 * @param newData the new data for the entity
 */
export const updateInPaginatedStore = <T extends { id: number | string }>(
  queryKey: QueryKey,
  id: number | string,
  newData: Partial<T>,
  queryClient: QueryClient
) => {
  queryClient.setQueriesData<ResourcePage<T> | undefined>(
    queryKey,
    (oldData) => {
      if (oldData === undefined) {
        return undefined;
      }

      const toUpdateIndex = oldData.data.findIndex(
        (entity) => entity.id === id
      );

      const isEntityOnPage = toUpdateIndex !== -1;

      if (!isEntityOnPage) {
        return oldData;
      }

      oldData.data[toUpdateIndex] = {
        ...oldData.data[toUpdateIndex],
        ...newData,
      };

      return oldData;
    }
  );
};

export const getItemInPaginatedStore = <T extends { id: number | string }>(
  queryKey: QueryKey,
  id: number,
  queryClient: QueryClient
) => {
  const stores = queryClient.getQueriesData<ResourcePage<T> | undefined>(
    queryKey
  );

  for (const store of stores) {
    const data = store[1]?.data;
    const item = data?.find((item) => item.id === id);
    if (item) {
      return item;
    }
  }

  return null;
};

export const doesItemExistInPaginatedStore = <
  T extends { id: number | string }
>(
  queryKey: QueryKey,
  id: number,
  queryClient: QueryClient
) => {
  const item = getItemInPaginatedStore<T>(queryKey, id, queryClient);
  return item !== null;
};
