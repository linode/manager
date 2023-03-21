/* eslint-disable sonarjs/no-small-switch */
import {
  createDatabase,
  deleteDatabase,
  getDatabaseBackups,
  getDatabaseCredentials,
  getDatabases,
  getDatabaseTypes,
  getDatabaseEngines,
  getEngineDatabase,
  restoreWithBackup,
  updateDatabase,
  resetDatabaseCredentials,
} from '@linode/api-v4/lib/databases';
import {
  CreateDatabasePayload,
  Database,
  DatabaseBackup,
  DatabaseCredentials,
  DatabaseInstance,
  DatabaseType,
  DatabaseEngine,
  Engine,
  UpdateDatabasePayload,
  UpdateDatabaseResponse,
} from '@linode/api-v4/lib/databases/types';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getAll } from 'src/utilities/getAll';
import { queryClient, queryPresets } from './base';
import { Event } from '@linode/api-v4/lib/account/types';

export const queryKey = 'databases';

export const useDatabaseQuery = (engine: Engine, id: number) =>
  useQuery<Database, APIError[]>([queryKey, 'database', id], () =>
    getEngineDatabase(engine, id)
  );

export const useDatabasesQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<DatabaseInstance>, APIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getDatabases(params, filter),
    { keepPreviousData: true }
  );

export const useAllDatabasesQuery = (enabled: boolean = true) =>
  useQuery<DatabaseInstance[], APIError[]>([queryKey, 'all'], getAllDatabases, {
    enabled,
  });

export const useDatabaseMutation = (engine: Engine, id: number) =>
  useMutation<UpdateDatabaseResponse, APIError[], UpdateDatabasePayload>(
    (data) => updateDatabase(engine, id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries([queryKey]);
        queryClient.setQueryData<Database>(
          [queryKey, 'database', id],
          (oldData) => {
            if (!oldData) {
              return undefined;
            }
            return { ...oldData, ...data };
          }
        );
      },
    }
  );

export const useCreateDatabaseMutation = () =>
  useMutation<Database, APIError[], CreateDatabasePayload>(
    (data) => createDatabase(data.engine?.split('/')[0] as Engine, data),
    {
      onSuccess: (data) => {
        // Invalidate useDatabasesQuery to show include the new database.
        // We choose to refetch insted of manually mutate the cache because it
        // is API paginated.
        queryClient.invalidateQueries([queryKey]);
        // Add database to the cache
        queryClient.setQueryData([queryKey, 'database', data.id], data);
      },
    }
  );

export const useDeleteDatabaseMutation = (engine: Engine, id: number) =>
  useMutation<{}, APIError[]>(() => deleteDatabase(engine, id), {
    onSuccess: () => {
      // Invalidate useDatabasesQuery to remove the deleted database.
      // We choose to refetch insted of manually mutate the cache because it
      // is API paginated.
      queryClient.invalidateQueries([queryKey]);
      queryClient.removeQueries([queryKey, 'database', id]);
    },
  });

export const useDatabaseBackupsQuery = (engine: Engine, id: number) =>
  useQuery<ResourcePage<DatabaseBackup>, APIError[]>(
    [queryKey, 'database', id, 'backups'],
    () => getDatabaseBackups(engine, id)
  );

export const getAllDatabases = () =>
  getAll<DatabaseInstance>((params) => getDatabases(params))().then(
    (data) => data.data
  );

export const getAllDatabaseEngines = () =>
  getAll<DatabaseEngine>((params) => getDatabaseEngines(params))().then(
    (data) => data.data
  );

export const useDatabaseEnginesQuery = () =>
  useQuery<DatabaseEngine[], APIError[]>(
    [queryKey, 'versions'],
    getAllDatabaseEngines
  );

export const getAllDatabaseTypes = () =>
  getAll<DatabaseType>((params) => getDatabaseTypes(params))().then(
    (data) => data.data
  );

export const useDatabaseTypesQuery = () =>
  useQuery<DatabaseType[], APIError[]>(
    [queryKey, 'types'],
    getAllDatabaseTypes
  );

export const useDatabaseCredentialsQuery = (
  engine: Engine,
  id: number,
  enabled: boolean = false
) =>
  useQuery<DatabaseCredentials, APIError[]>(
    [queryKey, 'database', id, 'credentials'],
    () => getDatabaseCredentials(engine, id),
    { ...queryPresets.oneTimeFetch, enabled }
  );

export const useDatabaseCredentialsMutation = (engine: Engine, id: number) =>
  useMutation<{}, APIError[]>(() => resetDatabaseCredentials(engine, id), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey, 'database', id, 'credentials']);
      queryClient.removeQueries([queryKey, 'database', id, 'credentials']);
    },
  });

export const useRestoreFromBackupMutation = (
  engine: Engine,
  databaseId: number,
  backupId: number
) =>
  useMutation<{}, APIError[]>(
    () => restoreWithBackup(engine, databaseId, backupId),
    {
      onSuccess: () =>
        updateStoreForDatabase(databaseId, { status: 'restoring' }),
    }
  );

export const databaseEventsHandler = (event: Event) => {
  const { status } = event;

  if (['notification', 'failed', 'finished'].includes(status)) {
    queryClient.invalidateQueries([queryKey]);
  }
};

const updateStoreForDatabase = (
  id: number,
  data: Partial<Database> & Partial<DatabaseInstance>
) => {
  updateDatabaseStore(id, data);
  queryClient.invalidateQueries([queryKey, 'paginated']);
};

const updateDatabaseStore = (id: number, newData: Partial<Database>) => {
  const previousValue = queryClient.getQueryData([queryKey, id]);

  // This previous value check makes sure we don't set the Database store to undefined.
  // This is an odd edge case.
  if (previousValue) {
    queryClient.setQueryData<Database | undefined>(
      [queryKey, 'database', id],
      (oldData) => {
        if (oldData === undefined) {
          return undefined;
        }

        return {
          ...oldData,
          ...newData,
        };
      }
    );
  }
};
