import { useQuery, useMutation } from 'react-query';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import {
  CreateDatabasePayload,
  CreateDatabaseResponse,
  Database,
  UpdateDatabasePayload,
  UpdateDatabaseResponse,
} from '@linode/api-v4/lib/databases/types';
import {
  createDatabase,
  deleteDatabase,
  getDatabases,
  getMySQLDatabase,
  updateMySQLDatabase,
} from '@linode/api-v4/lib/databases';

export const queryKey = 'databases';

export const useDatabaseQuery = (id: number) =>
  useQuery<Database, APIError[]>([queryKey, id], () => getMySQLDatabase(id));

export const useDatabasesQuery = () =>
  useQuery<ResourcePage<Database>, APIError[]>(queryKey, getDatabases);

// We may want to pass the id as a React Query variable depending on the
// implementation at the component level.
export const useDatabaseMutation = (id: number) =>
  useMutation<UpdateDatabaseResponse, APIError[], UpdateDatabasePayload>(
    (data) => updateMySQLDatabase(id, data),
    {
      onSuccess: () => {
        // We need to update the cache for this database [queryKey, id], but do we need to update the cache
        // that contains the results of /databases/instances?
      },
    }
  );

export const useCreateDatabaseMutation = () =>
  useMutation<CreateDatabaseResponse, APIError[], CreateDatabasePayload>(
    createDatabase,
    {
      onSuccess: () => {
        // Add database to the cache for /databases/instances
      },
    }
  );

// We may want to pass the id as a React Query variable depending on the
// implementation at the component level.
export const useDeleteDatabaseMutation = (id: number) =>
  useMutation<{}, APIError[]>(() => deleteDatabase(id), {
    onSuccess: () => {
      // Delete Database instance from the React Query Cache
    },
  });
