import {
  createDatabase,
  createDatabaseConnectionPool,
  deleteDatabase,
  deleteDatabaseConnectionPool,
  legacyRestoreWithBackup,
  patchDatabase,
  resetDatabaseCredentials,
  restoreWithBackup,
  resumeDatabase,
  suspendDatabase,
  updateDatabase,
  updateDatabaseConnectionPool,
} from '@linode/api-v4/lib/databases';
import { profileQueries, queryPresets } from '@linode/queries';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { databaseQueries } from './keys';

import type {
  APIError,
  ConnectionPool,
  CreateDatabasePayload,
  Database,
  DatabaseBackup,
  DatabaseBackupsPayload,
  DatabaseCredentials,
  DatabaseEngine,
  DatabaseEngineConfig,
  DatabaseInstance,
  DatabaseType,
  Engine,
  Filter,
  Params,
  ResourcePage,
  UpdateDatabasePayload,
} from '@linode/api-v4';

export const useDatabaseQuery = (engine: Engine, id: number) =>
  useQuery<Database, APIError[]>({
    ...databaseQueries.database(engine, id),
    // @TODO Consider removing polling
    // The refetchInterval will poll the API for this Database. We will do this
    // to ensure we have up to date information. We do this polling because the events
    // API does not provide us every feature we need currently.
    refetchInterval: 20000,
  });

export const useDatabasesQuery = (
  params: Params,
  filter: Filter,
  isEnabled: boolean | undefined,
) =>
  useQuery<ResourcePage<DatabaseInstance>, APIError[]>({
    ...databaseQueries.databases._ctx.paginated(params, filter),
    enabled: isEnabled,
    placeholderData: keepPreviousData,
    // @TODO Consider removing polling
    refetchInterval: 20000,
  });

export const useDatabasesInfiniteQuery = (filter: Filter, enabled: boolean) => {
  return useInfiniteQuery<ResourcePage<DatabaseInstance>, APIError[]>({
    ...databaseQueries.databases._ctx.infinite(filter),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    retry: false,
  });
};

export const useAllDatabasesQuery = (
  enabled: boolean = true,
  params: Params = {},
  filter: Filter = {},
) =>
  useQuery<DatabaseInstance[], APIError[]>({
    ...databaseQueries.databases._ctx.all(params, filter),
    enabled,
  });

export const useDatabaseMutation = (engine: Engine, id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Database, APIError[], UpdateDatabasePayload>({
    mutationFn: (data) => updateDatabase(engine, id, data),
    onSuccess(database) {
      queryClient.invalidateQueries({
        queryKey: databaseQueries.databases.queryKey,
      });
      queryClient.setQueryData<Database>(
        databaseQueries.database(engine, id).queryKey,
        database,
      );
    },
  });
};

export const usePatchDatabaseMutation = (engine: Engine, id: number) => {
  const queryClient = useQueryClient();
  return useMutation<void, APIError[], void>({
    mutationFn: () => patchDatabase(engine, id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: databaseQueries.databases.queryKey,
      });
      queryClient.invalidateQueries({
        exact: true,
        queryKey: databaseQueries.database(engine, id).queryKey,
      });
    },
  });
};

export const useCreateDatabaseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Database, APIError[], CreateDatabasePayload>({
    mutationFn: (data) =>
      createDatabase(data.engine?.split('/')[0] as Engine, data),
    onSuccess(database) {
      queryClient.invalidateQueries({
        queryKey: databaseQueries.databases.queryKey,
      });
      queryClient.setQueryData<Database>(
        databaseQueries.database(database.engine, database.id).queryKey,
        database,
      );
      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries({
        queryKey: profileQueries.grants.queryKey,
      });
    },
  });
};

export const useDeleteDatabaseMutation = (engine: Engine, id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteDatabase(engine, id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: databaseQueries.databases.queryKey,
      });
      queryClient.removeQueries({
        queryKey: databaseQueries.database(engine, id).queryKey,
      });
    },
  });
};

export const useSuspendDatabaseMutation = (engine: Engine, id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => suspendDatabase(engine, id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: databaseQueries.databases.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: databaseQueries.database(engine, id).queryKey,
      });
    },
  });
};

export const useResumeDatabaseMutation = (engine: Engine, id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => resumeDatabase(engine, id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: databaseQueries.databases.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: databaseQueries.database(engine, id).queryKey,
      });
    },
  });
};

export const useDatabaseBackupsQuery = (
  engine: Engine,
  id: number,
  enabled: boolean = false,
) =>
  useQuery<ResourcePage<DatabaseBackup>, APIError[]>({
    ...databaseQueries.database(engine, id)._ctx.backups,
    enabled,
  });

export const useDatabaseConnectionPool = (
  databaseId: number,
  poolName: string,
  enabled: boolean = false,
) =>
  useQuery<ConnectionPool, APIError[]>({
    ...databaseQueries
      .database('postgresql', databaseId)
      ._ctx.connectionPools._ctx.pool(poolName),
    enabled,
  });

export const useDatabaseConnectionPools = (
  databaseId: number,
  enabled: boolean = false,
) =>
  useQuery<ResourcePage<ConnectionPool>, APIError[]>({
    ...databaseQueries.database('postgresql', databaseId)._ctx.connectionPools
      ._ctx.pools,
    enabled,
  });

export const useCreateDatabaseConnectionPoolMutation = (databaseId: number) => {
  const queryClient = useQueryClient();
  return useMutation<ConnectionPool, APIError[], ConnectionPool>({
    mutationFn: (data) => createDatabaseConnectionPool(databaseId, data),
    onSuccess() {
      queryClient.invalidateQueries(
        databaseQueries.database('postgresql', databaseId)._ctx.connectionPools,
      );
    },
  });
};

export const useUpdateDatabaseConnectionPoolMutation = (
  databaseId: number,
  poolName: string,
) => {
  const queryClient = useQueryClient();
  return useMutation<ConnectionPool, APIError[], Omit<ConnectionPool, 'label'>>(
    {
      mutationFn: (data) =>
        updateDatabaseConnectionPool(databaseId, poolName, data),
      onSuccess(connectionPool) {
        queryClient.setQueryData<ConnectionPool>(
          databaseQueries
            .database('postgresql', databaseId)
            ._ctx.connectionPools._ctx.pool(connectionPool.label).queryKey,
          connectionPool,
        );
      },
    },
  );
};

export const useDeleteDatabaseConnectionPoolMutation = (
  databaseId: number,
  poolName: string,
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteDatabaseConnectionPool(databaseId, poolName),
    onSuccess() {
      queryClient.invalidateQueries(
        databaseQueries.database('postgresql', databaseId)._ctx.connectionPools,
      );
      queryClient.removeQueries({
        queryKey: databaseQueries.database('postgresql', databaseId)._ctx
          .connectionPools.queryKey,
      });
    },
  });
};

export const useDatabaseEnginesQuery = (enabled: boolean = false) =>
  useQuery<DatabaseEngine[], APIError[]>({
    ...databaseQueries.engines,
    enabled,
  });

export const useDatabaseTypesQuery = (
  filter: Filter = {},
  enabled: boolean = true,
) =>
  useQuery<DatabaseType[], APIError[]>({
    ...databaseQueries.types._ctx.all(filter),
    enabled,
  });

export const useDatabaseEngineConfig = (
  engine: Engine,
  enabled: boolean = true,
) =>
  useQuery<DatabaseEngineConfig, APIError[]>({
    ...databaseQueries.configs(engine),
    enabled,
  });

export const useDatabaseCredentialsQuery = (
  engine: Engine,
  id: number,
  enabled: boolean = false,
) =>
  useQuery<DatabaseCredentials, APIError[]>({
    ...databaseQueries.database(engine, id)._ctx.credentials,
    ...queryPresets.oneTimeFetch,
    enabled,
  });

export const useDatabaseCredentialsMutation = (engine: Engine, id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => resetDatabaseCredentials(engine, id),
    onSuccess() {
      queryClient.removeQueries({
        queryKey: databaseQueries.database(engine, id)._ctx.credentials
          .queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: databaseQueries.database(engine, id)._ctx.credentials
          .queryKey,
      });
    },
  });
};

export const useLegacyRestoreFromBackupMutation = (
  engine: Engine,
  databaseId: number,
  backupId: number,
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => legacyRestoreWithBackup(engine, databaseId, backupId),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: databaseQueries.databases.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: databaseQueries.database(engine, databaseId).queryKey,
      });
    },
  });
};

export const useRestoreFromBackupMutation = (
  engine: Engine,
  data: DatabaseBackupsPayload,
) => {
  const queryClient = useQueryClient();
  return useMutation<Database, APIError[]>({
    mutationFn: () => restoreWithBackup(engine, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: databaseQueries.databases.queryKey,
      });
    },
  });
};
