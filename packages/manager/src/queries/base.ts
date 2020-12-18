import { APIError } from '@linode/api-v4/lib/types';
import { QueryCache, QueryConfig, MutationConfig } from 'react-query';
import { Entity } from 'src/store/types';

// =============================================================================
// Config
// =============================================================================
type QueryConfigTypes = 'shortLived' | 'longLived' | 'oneTimeFetch';

export const queryPresets: Record<
  QueryConfigTypes,
  Partial<QueryConfig<any, any>>
> = {
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

export const queryCache = new QueryCache({
  defaultConfig: {
    queries: queryPresets.longLived
  }
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
): MutationConfig<T, E, Partial<T>, () => void> => {
  return {
    onSuccess: updatedEntity => {
      // Update the query data to include the newly updated Entity.
      return queryCache.setQueryData<ItemsByID<T>, ItemsByID<T>>(
        queryKey,
        oldData => ({
          ...oldData,
          [entityID]: updatedEntity
        })
      );
    }
  };
};
