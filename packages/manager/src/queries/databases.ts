import {
  createDatabase,
  deleteDatabase,
  getDatabaseBackups,
  getDatabaseCredentials,
  getDatabases,
  getDatabaseTypes,
  getDatabaseVersions,
  getEngineDatabase,
  restoreWithBackup,
  updateDatabase,
} from '@linode/api-v4/lib/databases';
import {
  CreateDatabasePayload,
  Database,
  DatabaseBackup,
  DatabaseCredentials,
  DatabaseInstance,
  DatabaseType,
  DatabaseVersion,
  Engine,
  UpdateDatabasePayload,
  UpdateDatabaseResponse,
} from '@linode/api-v4/lib/databases/types';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryClient } from './base';

export const queryKey = 'databases';

export const useDatabaseQuery = (id: number) => {
  const storedEngine = getDatabaseEngine(id);

  const { data } = useAllDatabasesQuery(storedEngine === undefined);

  const engineFromFetchAll = data?.find((database) => database.id === id)
    ?.engine;

  const foundEngine =
    storedEngine !== undefined || engineFromFetchAll !== undefined;

  return useQuery<Database, APIError[]>(
    [queryKey, id],
    () => getEngineDatabase(storedEngine || engineFromFetchAll!, id),
    { enabled: foundEngine }
  );
};

export const useDatabasesQuery = (params: any, filter: any) =>
  useQuery<ResourcePage<DatabaseInstance>, APIError[]>(
    [`${queryKey}-list`, params, filter],
    () => getDatabases(params, filter),
    { keepPreviousData: true }
  );

export const useAllDatabasesQuery = (enabled: boolean = true) =>
  useQuery<DatabaseInstance[], APIError[]>(
    [`${queryKey}-all-list`],
    getAllDatabases,
    { enabled }
  );

export const useDatabaseMutation = (engine: Engine, id: number) =>
  useMutation<UpdateDatabaseResponse, APIError[], UpdateDatabasePayload>(
    (data) => updateDatabase(engine, id, data),
    {
      onSuccess: (data) => {
        queryClient.setQueryData<Database | undefined>(
          `${queryKey}-${id}`,
          (oldEntity) => {
            if (oldEntity === undefined) {
              return undefined;
            }

            if (oldEntity.label !== data.label) {
              // Invalidate useDatabasesQuery to reflect the new database label.
              // We choose to refetch insted of manually mutate the cache because it
              // is API paginated.
              queryClient.invalidateQueries(`${queryKey}-list`);
            }

            return { ...oldEntity, ...data };
          }
        );
      },
    }
  );

export const useCreateDatabaseMutation = () =>
  useMutation<Database, APIError[], CreateDatabasePayload>(
    (data) => createDatabase(data.engine, data),
    {
      onSuccess: (data) => {
        // Invalidate useDatabasesQuery to show include the new database.
        // We choose to refetch insted of manually mutate the cache because it
        // is API paginated.
        queryClient.invalidateQueries(`${queryKey}-list`);
        // Add database to the cache
        queryClient.setQueryData(`${queryKey}-${data.id}`, data);
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

export const useDatabaseBackupsQuery = (
  engine: Engine | undefined,
  id: number
) =>
  useQuery<ResourcePage<DatabaseBackup>, APIError[]>(
    [`${queryKey}-backups`, id],
    () => getDatabaseBackups(engine!, id),
    { enabled: !!engine }
  );

export const getAllDatabaseVersions = () =>
  getAll<DatabaseVersion>((params) => getDatabaseVersions(params))().then(
    (data) => data.data
  );

export const getAllDatabases = () =>
  getAll<DatabaseInstance>((params) => getDatabases(params))().then(
    (data) => data.data
  );

export const useDatabaseVersionsQuery = () =>
  useQuery<DatabaseVersion[], APIError[]>(
    `${queryKey}-versions`,
    getAllDatabaseVersions
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

export const useDatabaseCredentialsQuery = (engine: Engine, id: number) =>
  useQuery<DatabaseCredentials, APIError[]>(
    [`${queryKey}-credentials`, id],
    () => getDatabaseCredentials(engine, id)
  );

export const useRestoreFromBackupMutation = (
  engine: Engine,
  databaseId: number,
  backupId: number
) =>
  useMutation<{}, APIError[]>(() =>
    restoreWithBackup(engine, databaseId, backupId)
  );

const getDatabaseEngine = (id: number) => {
  const queries = queryClient.getQueriesData<ResourcePage<Database>>(
    `${queryKey}-list`
  );

  for (const query of queries) {
    const database = query[1].data.find((database) => database.id === id);
    if (database) {
      return database.engine;
    }
  }

  return undefined;
};
