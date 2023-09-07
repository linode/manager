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
import {
  CreateDatabasePayload,
  Database,
  DatabaseBackup,
  DatabaseCredentials,
  DatabaseEngine,
  DatabaseInstance,
  DatabaseType,
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
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { EventWithStore } from 'src/events';
import { getAll } from 'src/utilities/getAll';

import { queryPresets, updateInPaginatedStore } from './base';
import { queryKey as PROFILE_QUERY_KEY } from './profile';

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

export const useDatabasesQuery = (params: Params, filter: Filter) =>
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

export const useDatabaseMutation = (engine: Engine, id: number) => {
  const queryClient = useQueryClient();
  return useMutation<UpdateDatabaseResponse, APIError[], UpdateDatabasePayload>(
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
              updateInPaginatedStore<Database>(
                `${queryKey}-list`,
                id,
                {
                  label: data.label,
                },
                queryClient
              );
            }

            return { ...oldEntity, ...data };
          }
        );
      },
    }
  );
};

export const useCreateDatabaseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Database, APIError[], CreateDatabasePayload>(
    (data) => createDatabase(data.engine?.split('/')[0] as Engine, data),
    {
      onSuccess: (data) => {
        // Invalidate useDatabasesQuery to show include the new database.
        // We choose to refetch insted of manually mutate the cache because it
        // is API paginated.
        queryClient.invalidateQueries(`${queryKey}-list`);
        // Add database to the cache
        queryClient.setQueryData([queryKey, data.id], data);
        // If a restricted user creates an entity, we must make sure grants are up to date.
        queryClient.invalidateQueries([PROFILE_QUERY_KEY, 'grants']);
      },
    }
  );
};

export const useDeleteDatabaseMutation = (engine: Engine, id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteDatabase(engine, id), {
    onSuccess: () => {
      // Invalidate useDatabasesQuery to remove the deleted database.
      // We choose to refetch insted of manually mutate the cache because it
      // is API paginated.
      queryClient.invalidateQueries(`${queryKey}-list`);
    },
  });
};

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

export const useDatabaseCredentialsMutation = (engine: Engine, id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(
    () => resetDatabaseCredentials(engine, id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([`${queryKey}-credentials`, id]);
        queryClient.removeQueries([`${queryKey}-credentials`, id]);
      },
    }
  );
};

export const useRestoreFromBackupMutation = (
  engine: Engine,
  databaseId: number,
  backupId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(
    () => restoreWithBackup(engine, databaseId, backupId),
    {
      onSuccess: () =>
        updateStoreForDatabase(
          databaseId,
          { status: 'restoring' },
          queryClient
        ),
    }
  );
};

export const databaseEventsHandler = (event: EventWithStore) => {
  const {
    event: { action, entity, status },
    queryClient,
  } = event;

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
  data: Partial<Database> & Partial<DatabaseInstance>,
  queryClient: QueryClient
) => {
  updateDatabaseStore(id, data, queryClient);
  updateInPaginatedStore<Database>(`${queryKey}-list`, id, data, queryClient);
};

const updateDatabaseStore = (
  id: number,
  newData: Partial<Database>,
  queryClient: QueryClient
) => {
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
