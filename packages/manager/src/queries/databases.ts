/* eslint-disable sonarjs/no-small-switch */
import {
  createDatabase,
  deleteDatabase,
  getDatabaseBackups,
  getDatabaseCredentials,
  getDatabaseEngines,
  getDatabaseTypes,
  getDatabases,
  getEngineDatabase,
  resetDatabaseCredentials,
  restoreWithBackup,
  updateDatabase,
} from '@linode/api-v4/lib/databases';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EventHandlerData } from 'src/hooks/useEventHandlers';
import { getAll } from 'src/utilities/getAll';
import { getEngineFromDatabaseEntityURL } from 'src/utilities/getEventsActionLink';

import { queryPresets } from './base';
import { profileQueries } from './profile';

import type {
  APIError,
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

export const getAllDatabases = () =>
  getAll<DatabaseInstance>((params) => getDatabases(params))().then(
    (data) => data.data
  );

export const getAllDatabaseEngines = () =>
  getAll<DatabaseEngine>((params) => getDatabaseEngines(params))().then(
    (data) => data.data
  );

export const getAllDatabaseTypes = () =>
  getAll<DatabaseType>((params) => getDatabaseTypes(params))().then(
    (data) => data.data
  );

const databaseQueries = createQueryKeys('databases', {
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
  engines: {
    queryFn: getAllDatabaseEngines,
    queryKey: null,
  },
  lists: {
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
  types: {
    queryFn: getAllDatabaseTypes,
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

export const useDatabasesQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<DatabaseInstance>, APIError[]>({
    ...databaseQueries.lists._ctx.paginated(params, filter),
    keepPreviousData: true,
    // @TODO Consider removing polling
    refetchInterval: 20000,
  });

export const useAllDatabasesQuery = (enabled: boolean = true) =>
  useQuery<DatabaseInstance[], APIError[]>({
    ...databaseQueries.lists._ctx.all,
    enabled,
  });

export const useDatabaseMutation = (engine: Engine, id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Database, APIError[], UpdateDatabasePayload>({
    mutationFn: (data) => updateDatabase(engine, id, data),
    onSuccess(database) {
      queryClient.invalidateQueries({
        queryKey: databaseQueries.lists.queryKey,
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
  return useMutation<Database, APIError[], CreateDatabasePayload>({
    mutationFn: (data) =>
      createDatabase(data.engine?.split('/')[0] as Engine, data),
    onSuccess(database) {
      queryClient.invalidateQueries({
        queryKey: databaseQueries.lists.queryKey,
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
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteDatabase(engine, id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: databaseQueries.lists.queryKey,
      });
      queryClient.removeQueries({
        queryKey: databaseQueries.database(engine, id).queryKey,
      });
    },
  });
};

export const useDatabaseBackupsQuery = (engine: Engine, id: number) =>
  useQuery<ResourcePage<DatabaseBackup>, APIError[]>(
    databaseQueries.database(engine, id)._ctx.backups
  );

export const useDatabaseEnginesQuery = (enabled: boolean = false) =>
  useQuery<DatabaseEngine[], APIError[]>({
    ...databaseQueries.engines,
    enabled,
  });

export const useDatabaseTypesQuery = () =>
  useQuery<DatabaseType[], APIError[]>(databaseQueries.types);

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

export const useRestoreFromBackupMutation = (
  engine: Engine,
  databaseId: number,
  backupId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => restoreWithBackup(engine, databaseId, backupId),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: databaseQueries.lists.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: databaseQueries.database(engine, databaseId).queryKey,
      });
    },
  });
};

export const databaseEventsHandler = ({
  event,
  queryClient,
}: EventHandlerData) => {
  if (['failed', 'finished', 'notification'].includes(event.status)) {
    queryClient.invalidateQueries({ queryKey: databaseQueries.lists.queryKey });

    /**
     * This is what a Database event entity looks like:
     *
     * "entity": {
     *   "label": "my-db-staging",
     *   "id": 2959,
     *   "type": "database",
     *   "url": "/v4/databases/postgresql/instances/2959"
     * },
     */
    if (event.entity) {
      const engine = getEngineFromDatabaseEntityURL(event.entity.url);

      if (!engine) {
        // eslint-disable-next-line no-console
        return console.warn(
          'Unable to get DBaaS engine from entity URL in event',
          event.id
        );
      }

      queryClient.invalidateQueries({
        queryKey: databaseQueries.database(engine as Engine, event.entity.id)
          .queryKey,
      });
    }
  }
};
