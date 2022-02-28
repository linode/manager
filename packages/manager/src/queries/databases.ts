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
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryClient, queryPresets } from './base';
import { Event } from '@linode/api-v4/lib/account/types';

export const queryKey = 'databases';

export const useDatabaseQuery = (engine: Engine, id: number) =>
  useQuery<Database, APIError[]>(
    [queryKey, id],
    () => getEngineDatabase(engine, id),
    // @TODO Consider removing polling
    // The refetchInterval will poll the API for this Database. We will do this
    // to ensure we have up to date information. We do this polling because the events
    // API does not provide us every feature we need currently.
    { refetchInterval: 20000 }
  );

export const useDatabasesQuery = (params: any, filter: any) =>
  useQuery<ResourcePage<DatabaseInstance>, APIError[]>(
    [`${queryKey}-list`, params, filter],
    () => getDatabases(params, filter),
    // @TODO Consider removing polling
    { keepPreviousData: true, refetchInterval: 20000 }
  );

export const useAllDatabasesQuery = (enabled: boolean = true) =>
  useQuery<DatabaseInstance[], APIError[]>(
    `${queryKey}-all-list`,
    getAllDatabases,
    { enabled }
  );

export const useDatabaseMutation = (engine: Engine, id: number) =>
  useMutation<UpdateDatabaseResponse, APIError[], UpdateDatabasePayload>(
    (data) => updateDatabase(engine, id, data),
    {
      onSuccess: (data) => {
        queryClient.setQueryData<Database | undefined>(
          [queryKey, Number(id)],
          (oldEntity) => {
            if (oldEntity === undefined) {
              return undefined;
            }

            if (oldEntity.label !== data.label) {
              updatePaginatedDatabaseStore(id, { label: data.label });
            }

            return { ...oldEntity, ...data };
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
        queryClient.invalidateQueries(`${queryKey}-list`);
        // Add database to the cache
        queryClient.setQueryData([queryKey, data.id], data);
      },
    }
  );

export const useDeleteDatabaseMutation = (engine: Engine, id: number) =>
  useMutation<{}, APIError[]>(() => deleteDatabase(engine, id), {
    onSuccess: () => {
      // Invalidate useDatabasesQuery to remove the deleted database.
      // We choose to refetch insted of manually mutate the cache because it
      // is API paginated.
      queryClient.invalidateQueries(`${queryKey}-list`);
    },
  });

export const useDatabaseBackupsQuery = (engine: Engine, id: number) =>
  useQuery<ResourcePage<DatabaseBackup>, APIError[]>(
    [`${queryKey}-backups`, id],
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
    `${queryKey}-versions`,
    getAllDatabaseEngines
  );

export const getAllDatabaseTypes = () =>
  getAll<DatabaseType>((params) => getDatabaseTypes(params))().then(
    (data) => data.data
  );

export const useDatabaseTypesQuery = () =>
  useQuery<DatabaseType[], APIError[]>(
    `${queryKey}-types`,
    getAllDatabaseTypes
  );

export const useDatabaseCredentialsQuery = (
  engine: Engine,
  id: number,
  enabled: boolean = false
) =>
  useQuery<DatabaseCredentials, APIError[]>(
    [`${queryKey}-credentials`, id],
    () => getDatabaseCredentials(engine, id),
    { ...queryPresets.oneTimeFetch, enabled }
  );

export const useDatabaseCredentialsMutation = (engine: Engine, id: number) =>
  useMutation<{}, APIError[]>(() => resetDatabaseCredentials(engine, id), {
    onSuccess: () => {
      queryClient.invalidateQueries([`${queryKey}-credentials`, id]);
      queryClient.removeQueries([`${queryKey}-credentials`, id]);
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
  const { action, status, entity } = event;

  switch (action) {
    case 'database_create':
      switch (status) {
        case 'failed':
        case 'finished':
          // Database status will change from `provisioning` to `active` (or `failed`) and
          // the host fields will populate. We need to refetch to get the hostnames.
          queryClient.invalidateQueries([queryKey, entity!.id]);
          queryClient.invalidateQueries(`${queryKey}-list`);
        case 'notification':
          // In this case, the API let us know the user initialized a Database create event.
          // We use this logic for the case a user created a Database from outside Cloud Manager,
          // they would expect to see their database populate without a refresh.
          const storedDatabase = queryClient.getQueryData<Database>([
            queryKey,
            entity!.id,
          ]);
          if (!storedDatabase) {
            queryClient.invalidateQueries(`${queryKey}-list`);
          }
        case 'scheduled':
        case 'started':
          return;
      }
  }
};

const updateStoreForDatabase = (
  id: number,
  data: Partial<Database> & Partial<DatabaseInstance>
) => {
  updateDatabaseStore(id, data);
  updatePaginatedDatabaseStore(id, data);
};

const updateDatabaseStore = (id: number, newData: Partial<Database>) => {
  const previousValue = queryClient.getQueryData([queryKey, id]);

  // This previous value check makes sure we don't set the Database store to undefined.
  // This is an odd edge case.
  if (previousValue) {
    queryClient.setQueryData<Database | undefined>(
      [queryKey, id],
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

const updatePaginatedDatabaseStore = (
  id: number,
  newData: Partial<DatabaseInstance>
) => {
  queryClient.setQueriesData<ResourcePage<DatabaseInstance> | undefined>(
    `${queryKey}-list`,
    (oldData) => {
      if (oldData === undefined) {
        return undefined;
      }

      const databaseToUpdateIndex = oldData.data.findIndex(
        (database) => database.id === id
      );

      const isDatabaseOnPage = databaseToUpdateIndex !== -1;

      if (!isDatabaseOnPage) {
        return oldData;
      }

      oldData.data[databaseToUpdateIndex] = {
        ...oldData.data[databaseToUpdateIndex],
        ...newData,
      };

      return oldData;
    }
  );
};
