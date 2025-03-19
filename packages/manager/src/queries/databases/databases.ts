import {
  createDatabase,
  deleteDatabase,
  getDatabaseBackups,
  getDatabaseCredentials,
  getDatabases,
  getEngineDatabase,
  legacyRestoreWithBackup,
  patchDatabase,
  resetDatabaseCredentials,
  restoreWithBackup,
  resumeDatabase,
  suspendDatabase,
  updateDatabase,
} from '@linode/api-v4/lib/databases';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryPresets, profileQueries } from '@linode/queries';
import {
  getAllDatabaseEngines,
  getAllDatabaseTypes,
  getAllDatabases,
} from './requests';

import type {
  APIError,
  CreateDatabasePayload,
  Database,
  DatabaseBackup,
  DatabaseCredentials,
  DatabaseEngine,
  DatabaseFork,
  DatabaseInstance,
  DatabaseType,
  Engine,
  Filter,
  Params,
  ResourcePage,
  UpdateDatabasePayload,
} from '@linode/api-v4';

export const databaseQueries = createQueryKeys('databases', {
  database: (engine: Engine, id: number) => ({
    contextQueries: {
      backups: {
        queryFn: () => getDatabaseBackups(engine, id),
        queryKey: null,
      },
      credentials: {
        queryFn: () => getDatabaseCredentials(engine, id),
        queryKey: null,
      },
    },
    queryFn: () => getEngineDatabase(engine, id),
    queryKey: [engine, id],
  }),
  databases: {
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllDatabases(params, filter),
        queryKey: [params, filter],
      }),
      paginated: (params: Params, filter: Filter) => ({
        queryFn: () => getDatabases(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  engines: {
    queryFn: getAllDatabaseEngines,
    queryKey: null,
  },
  types: {
    contextQueries: {
      all: (filter: Filter = {}) => ({
        queryFn: () => getAllDatabaseTypes(filter),
        queryKey: [filter],
      }),
    },
    queryKey: null,
  },
});

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
  isEnabled: boolean | undefined
) =>
  useQuery<ResourcePage<DatabaseInstance>, APIError[]>({
    ...databaseQueries.databases._ctx.paginated(params, filter),
    enabled: isEnabled,
    placeholderData: keepPreviousData,
    // @TODO Consider removing polling
    refetchInterval: 20000,
  });

export const useAllDatabasesQuery = (
  enabled: boolean = true,
  params: Params = {},
  filter: Filter = {}
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
        database
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
        database
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
  enabled: boolean = false
) =>
  useQuery<ResourcePage<DatabaseBackup>, APIError[]>({
    ...databaseQueries.database(engine, id)._ctx.backups,
    enabled,
  });

export const useDatabaseEnginesQuery = (enabled: boolean = false) =>
  useQuery<DatabaseEngine[], APIError[]>({
    ...databaseQueries.engines,
    enabled,
  });

export const useDatabaseTypesQuery = (
  filter: Filter = {},
  enabled: boolean = true
) =>
  useQuery<DatabaseType[], APIError[]>({
    ...databaseQueries.types._ctx.all(filter),
    enabled,
  });

export const useDatabaseCredentialsQuery = (
  engine: Engine,
  id: number,
  enabled: boolean = false
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
  backupId: number
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
  fork: DatabaseFork
) => {
  const queryClient = useQueryClient();
  return useMutation<Database, APIError[]>({
    mutationFn: () => restoreWithBackup(engine, fork),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: databaseQueries.databases.queryKey,
      });
    },
  });
};
