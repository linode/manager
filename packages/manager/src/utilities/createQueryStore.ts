import { APIError } from '@linode/api-v4';
import {
  InvalidateOptions,
  InvalidateQueryFilters,
  QueryClient,
  QueryFunction,
  QueryKey,
  SetDataOptions,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from 'react-query';
import { QueryFilters, Updater } from 'react-query/types/core/utils';

// Methods that can be used at any level of a queryStore
interface BaseQueryMethods {
  invalidateQueries: (
    queryClient: QueryClient,
    filters?: InvalidateQueryFilters,
    options?: InvalidateOptions
  ) => Promise<void>;
}

// Methods that can only be used at levels where queryFn is specified
interface ResourceQueryMethods<TResource> {
  getQueryData: (
    queryClient: QueryClient,
    filters?: QueryFilters
  ) => TResource | undefined;
  setQueryData: (
    queryClient: QueryClient,
    updater: Updater<TResource | undefined, TResource>,
    options?: SetDataOptions
  ) => TResource;
  useQuery: (options: UseQueryOptions) => UseQueryResult<TResource, APIError[]>;
}

type QueryStore<TConfig> = BaseQueryMethods &
  (TConfig extends { queryFn: QueryFunction<infer TResource> }
    ? ResourceQueryMethods<TResource>
    : {}) &
  (TConfig extends { children: Record<string, unknown> }
    ? {
        [TConfigKey in keyof TConfig['children']]: TConfig['children'][TConfigKey] extends infer TFun
          ? TFun extends (...args: unknown[]) => infer TSubConfig
            ? ((...args: Parameters<TFun>) => QueryStore<TSubConfig>) &
                BaseQueryMethods
            : TConfig['children'][TConfigKey] extends QueryStoreConfig
            ? QueryStore<TConfig['children'][TConfigKey]>
            : {}
          : {};
      }
    : {});

// Interface to guide the creation of a QueryStore
interface QueryStoreConfig {
  children?: Record<
    string,
    ((...args: unknown[]) => QueryStoreConfig) | QueryStoreConfig
  >;
  queryFn?: QueryFunction;
  queryKey?: QueryKey;
}

export const createQueryStore = <T>(
  baseKey: QueryKey,
  config: T & QueryStoreConfig
): QueryStore<T> => {
  const queryKey = [
    ...(typeof baseKey == 'string' ? [baseKey] : baseKey),
    ...(config.queryKey
      ? typeof config.queryKey == 'string'
        ? [config.queryKey]
        : config.queryKey
      : []),
  ];

  return {
    invalidateQueries: (queryClient, filters, options) =>
      queryClient.invalidateQueries(queryKey, filters, options),
    ...(config.queryFn
      ? {
          getQueryData: (queryClient, filters) =>
            queryClient.getQueryData(queryKey, filters),
          setQueryData: (queryClient, updater, options) =>
            queryClient.setQueryData(queryKey, updater, options),
          useQuery: (options) => useQuery(queryKey, config.queryFn!, options),
        }
      : {}),
    ...(config.children
      ? Object.keys(config.children).reduce((acc, child) => {
          const childQueryKey = [...queryKey, child];
          return {
            ...acc,
            [child]:
              typeof config.children![child] == 'function'
                ? Object.assign(
                    (...args: unknown[]) =>
                      createQueryStore(
                        childQueryKey,
                        (config.children![child] as CallableFunction)(args)
                      ),
                    {
                      invalidateQueries: (queryClient, filters, options) =>
                        queryClient.invalidateQueries(
                          childQueryKey,
                          filters,
                          options
                        ),
                    } as BaseQueryMethods
                  )
                : createQueryStore(childQueryKey, config.children![child]),
          };
        }, {})
      : {}),
  } as QueryStore<T>;
};
