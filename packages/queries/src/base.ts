import { isEmpty } from '@linode/api-v4/lib/request';
import { QueryClient } from '@tanstack/react-query';

import type { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import type { QueryKey, UseMutationOptions } from '@tanstack/react-query';

// =============================================================================
// Config
// =============================================================================
export const queryPresets = {
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

/**
 * A list of API v4 error reasons for which we should *not* retry the API request.
 */
const reasonsToNotRety = ['Unauthorized', 'Not found'];

/**
 * Number of times a query is retried by default.
 */
const DEFAULT_RETRIES = 3;

/**
 * Creates and returns a new TanStack Query query client instance.
 *
 * Allows the query client behavior to be configured by specifying a preset. The
 * 'longLived' preset is most suitable for production use, while 'oneTimeFetch' is
 * preferred for tests.
 *
 * @param preset - Optional query preset for client. Either 'longLived' or 'oneTimeFetch'.
 *
 * @returns New `QueryClient` instance.
 */
export const queryClientFactory = (
  preset: 'longLived' | 'oneTimeFetch' = 'oneTimeFetch',
) => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry(failureCount, error) {
          if (getIsAPIErrorArray(error)) {
            // For some API errors, we don't want to retry.
            // Ideally, we'd do this conditionally based on the HTTP status code,
            // but the creators of the `APIError[]` type didn't think to surface
            // the status code, so we do it based on the `reason`.
            if (error.some((e) => reasonsToNotRety.includes(e.reason))) {
              return false;
            }
          }
          return failureCount < DEFAULT_RETRIES;
        },
        ...queryPresets[preset],
      },
    },
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
 * getIsAPIErrorArray
 * @param error an unknown error
 * @returns If the error is a APIError[]
 */
function getIsAPIErrorArray(error: unknown): error is APIError[] {
  if (!Array.isArray(error)) {
    return false;
  }
  if (error.length === 0) {
    // an empty array counts as a APIError[]
    return true;
  }
  // If the first element in the array contains a `reason` property,
  // we'll assume this is an APIError[]
  return Boolean(error[0]?.reason);
}

/**
 * "Indexers" for the following methods are included to handle
 * the case where an entity's primary key isn't "id." By
 * default, these methods will try to map Entity.id: Entity,
 * but consumers can override this to map over whatever value
 * is unique to that entity type. One example of this is Entity Transfers,
 * which have a unique primary key of "token."
 *
 */

export const listToItemsByID = <E extends { [id: number | string]: any }>(
  entityList: E[],
  indexer: string = 'id',
) => {
  return entityList.reduce<Record<string, E>>(
    (map, item) => ({ ...map, [item[indexer]]: item }),
    {},
  );
};

export const mutationHandlers = <
  T,
  V extends Record<string, any>,
  E = APIError[],
>(
  queryKey: QueryKey,
  indexer: string = 'id',
  queryClient: QueryClient,
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: (updatedEntity, variables) => {
      // Update the query data to include the newly updated Entity.
      queryClient.setQueryData<ItemsByID<T>>(queryKey, (oldData) => ({
        ...oldData,
        [variables[indexer as keyof V]]: updatedEntity,
      }));
    },
  };
};

export const simpleMutationHandlers = <T, V, E = APIError[]>(
  queryKey: QueryKey,
  queryClient: QueryClient,
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

export const creationHandlers = <
  T extends Record<string, any>,
  V,
  E = APIError[],
>(
  queryKey: QueryKey,
  indexer: string = 'id',
  queryClient: QueryClient,
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

export const deletionHandlers = <
  T,
  V extends Record<string, any>,
  E = APIError[],
>(
  queryKey: QueryKey,
  indexer: string = 'id',
  queryClient: QueryClient,
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
  E = APIError[],
>(
  queryKey: QueryKey,
  queryClient: QueryClient,
): UseMutationOptions<T, E, V, () => void> => {
  return {
    onSuccess: (updatedEntity, variables) => {
      queryClient.setQueryData<any[]>(queryKey, (oldData) => {
        if (!oldData) {
          return [];
        }

        const index = oldData?.findIndex(
          (item) => item.id === updatedEntity.id,
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
  queryClient: QueryClient,
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
  E = APIError[],
>(
  queryKey: QueryKey,
  queryClient: QueryClient,
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
  queryClient: QueryClient,
) => {
  queryClient.setQueriesData<ResourcePage<T> | undefined>(
    { queryKey },
    (oldData) => {
      if (oldData === undefined) {
        return undefined;
      }

      const toUpdateIndex = oldData.data.findIndex(
        (entity) => entity.id === id,
      );

      const isEntityOnPage = toUpdateIndex !== -1;

      if (!isEntityOnPage) {
        return oldData;
      }

      const updatedPaginatedData = [...oldData.data];

      updatedPaginatedData[toUpdateIndex] = {
        ...oldData.data[toUpdateIndex],
        ...newData,
      };

      return {
        ...oldData,
        data: updatedPaginatedData,
      };
    },
  );
};

export const getItemInPaginatedStore = <T extends { id: number | string }>(
  queryKey: QueryKey,
  id: number,
  queryClient: QueryClient,
) => {
  const stores = queryClient.getQueriesData<ResourcePage<T> | undefined>({
    queryKey,
  });

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
  T extends { id: number | string },
>(
  queryKey: QueryKey,
  id: number,
  queryClient: QueryClient,
) => {
  const item = getItemInPaginatedStore<T>(queryKey, id, queryClient);
  return item !== null;
};
