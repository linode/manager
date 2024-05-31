import {
  createDatabase,
  deleteDatabase,
  getDatabaseBackups,
  getDatabaseCredentials,
  getDatabases,
  getEngineDatabase,
  resetDatabaseCredentials,
  restoreWithBackup,
  updateDatabase,
} from '@linode/api-v4/lib/databases';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { profileQueries } from '../profile';
import {
  getAllDatabaseEngines,
  getAllDatabaseTypes,
  getAllDatabases,
} from './requests';

import type {
  CreateDatabasePayload,
  Database,
  DatabaseBackup,
  DatabaseCredentials,
  DatabaseEngine,
  DatabaseInstance,
  DatabaseType,
  Engine,
  Filter,
  Params,
  ResourcePage,
  UpdateDatabasePayload,
} from '@linode/api-v4';
import type { FormattedAPIError } from 'src/types/FormattedAPIError';

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
      all: {
        queryFn: getAllDatabases,
        queryKey: null,
      },
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
    queryFn: getAllDatabaseTypes,
    queryKey: null,
  },
});

export const useDatabaseQuery = (engine: Engine, id: number) =>
  useQuery<Database, FormattedAPIError[]>({
    ...databaseQueries.database(engine, id),
    // @TODO Consider removing polling
    // The refetchInterval will poll the API for this Database. We will do this
    // to ensure we have up to date information. We do this polling because the events
    // API does not provide us every feature we need currently.
    refetchInterval: 20000,
  });

export const useDatabasesQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<DatabaseInstance>, FormattedAPIError[]>({
    ...databaseQueries.databases._ctx.paginated(params, filter),
    keepPreviousData: true,
    // @TODO Consider removing polling
    refetchInterval: 20000,
  });

export const useAllDatabasesQuery = (enabled: boolean = true) =>
  useQuery<DatabaseInstance[], FormattedAPIError[]>({
    ...databaseQueries.databases._ctx.all,
    enabled,
  });

export const useDatabaseMutation = (engine: Engine, id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Database, FormattedAPIError[], UpdateDatabasePayload>({
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

export const useCreateDatabaseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Database, FormattedAPIError[], CreateDatabasePayload>({
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
      queryClient.invalidateQueries(profileQueries.grants.queryKey);
    },
  });
};

export const useDeleteDatabaseMutation = (engine: Engine, id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>({
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

export const useDatabaseBackupsQuery = (engine: Engine, id: number) =>
  useQuery<ResourcePage<DatabaseBackup>, FormattedAPIError[]>(
    databaseQueries.database(engine, id)._ctx.backups
  );

export const useDatabaseEnginesQuery = (enabled: boolean = false) =>
  useQuery<DatabaseEngine[], FormattedAPIError[]>({
    ...databaseQueries.engines,
    enabled,
  });

export const useDatabaseTypesQuery = () =>
  useQuery<DatabaseType[], FormattedAPIError[]>(databaseQueries.types);

export const useDatabaseCredentialsQuery = (
  engine: Engine,
  id: number,
  enabled: boolean = false
) =>
  useQuery<DatabaseCredentials, FormattedAPIError[]>({
    ...databaseQueries.database(engine, id)._ctx.credentials,
    ...queryPresets.oneTimeFetch,
    enabled,
  });

export const useDatabaseCredentialsMutation = (engine: Engine, id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>({
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

export const useRestoreFromBackupMutation = (
  engine: Engine,
  databaseId: number,
  backupId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>({
    mutationFn: () => restoreWithBackup(engine, databaseId, backupId),
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
