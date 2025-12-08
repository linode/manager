import {
  getDatabaseBackups,
  getDatabaseConnectionPool,
  getDatabaseConnectionPools,
  getDatabaseCredentials,
  getDatabaseEngineConfig,
  getDatabases,
  getEngineDatabase,
} from '@linode/api-v4/lib/databases';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import {
  getAllDatabaseEngines,
  getAllDatabases,
  getAllDatabaseTypes,
} from './requests';

import type { Engine, Filter, Params } from '@linode/api-v4';

export const databaseQueries = createQueryKeys('databases', {
  configs: (engine: Engine) => ({
    queryFn: () => getDatabaseEngineConfig(engine),
    queryKey: ['configs', engine],
  }),
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
      connectionPools: {
        contextQueries: {
          pool: (poolName: string) => ({
            queryFn: () => getDatabaseConnectionPool(id, poolName),
            queryKey: [poolName],
          }),
          pools: {
            queryFn: () => getDatabaseConnectionPools(id),
            queryKey: null,
          },
        },
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
      infinite: (filter: Filter) => ({
        queryFn: ({ pageParam }) =>
          getDatabases({ page: pageParam as number }, filter),
        queryKey: [filter],
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
