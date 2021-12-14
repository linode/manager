import { useQuery, useMutation } from 'react-query';
import { APIError } from '@linode/api-v4/lib/types';

interface MutatableDatabaseValues {
  label: string;
  allow_list: string[];
}

interface Database extends MutatableDatabaseValues {
  id: number;
}

interface CreateDatabasePayload {
  label: string;
  region: string;
  type: string;
  standby_count?: number;
  replica_count?: number;
  engine?: string;
  encrypted?: boolean;
  ssl_connection?: boolean;
  replication_type: 'none';
  allow_list?: string[];
  tags?: string[];
}

export const queryKey = 'databases';

export const useDatabaseQuery = (id: number) =>
  useQuery<Database, APIError[]>([queryKey, id]);

export const useDatabasesQuery = () =>
  useQuery<Database[], APIError[]>(queryKey);

export const useDatabaseMutation = (id: number) =>
  useMutation<MutatableDatabaseValues, APIError[], MutatableDatabaseValues>(
    async () => {
      return {
        label: 'test',
        allow_list: [],
      };
    },
    {
      onSuccess: () => {
        // We need to update the cache for this database [queryKey, id], but do we need to update the cache
        // that contains the results of /databases/instances?
      },
    }
  );

export const useCreateDatabaseMutation = () =>
  useMutation<Database, APIError[], CreateDatabasePayload>(
    async () => ({
      id: 1,
      label: '',
      allow_list: [],
    }),
    {
      onSuccess: () => {
        // Add database to the cache for /databases/instances
      },
    }
  );

export const useDeleteDatabaseMutation = () =>
  useMutation<{}, APIError[], { id: number }>(
    async ({ id }) => {
      return {
        // Replace this dummy function with the delete function from @linode/api-v4
      };
    },
    {
      onSuccess: () => {
        // Delete Database instance from the React Query Cache
      },
    }
  );
