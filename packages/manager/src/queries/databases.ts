import { useQuery, useMutation } from 'react-query';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import {
  CreateDatabasePayload,
  CreateDatabaseResponse,
  Database,
  DatabaseBackup,
  Engine,
  UpdateDatabasePayload,
  UpdateDatabaseResponse,
} from '@linode/api-v4/lib/databases/types';
import {
  createDatabase,
  deleteDatabase,
  getDatabaseBackups,
  getDatabases,
  getEngineDatabase,
  updateDatabase,
} from '@linode/api-v4/lib/databases';

export const queryKey = 'databases';

export const useDatabaseQuery = (engine: Engine, id: number) =>
  useQuery<Database, APIError[]>([queryKey, id], () =>
    getEngineDatabase(engine, id)
  );

export const useDatabasesQuery = (params: any, filter: any) =>
  useQuery<ResourcePage<Database>, APIError[]>(
    queryKey,
    () => getDatabases(params, filter),
    { keepPreviousData: true }
  );

export const useDatabaseMutation = (engine: Engine, id: number) =>
  useMutation<UpdateDatabaseResponse, APIError[], UpdateDatabasePayload>(
    (data) => updateDatabase(engine, id, data),
    {
      onSuccess: () => {
        // We need to update the cache for this database [queryKey, id], but do we need to update the cache
        // that contains the results of /databases/instances?
      },
    }
  );

export const useCreateDatabaseMutation = () =>
  useMutation<CreateDatabaseResponse, APIError[], CreateDatabasePayload>(
    (data) => createDatabase(data.engine || 'mysql', data),
    {
      onSuccess: () => {
        // Add database to the cache
      },
    }
  );

export const useDeleteDatabaseMutation = (engine: Engine, id: number) =>
  useMutation<{}, APIError[]>(() => deleteDatabase(engine, id), {
    onSuccess: () => {
      // Delete Database instance from the cache
    },
  });

export const useDatabaseBackupsQuery = (engine: Engine, id: number) =>
  useQuery<ResourcePage<DatabaseBackup>, APIError[]>(
    [`${queryKey}-backups`, id],
    () => getDatabaseBackups(engine, id)
  );
