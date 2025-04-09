import {
  createDatabaseSchema,
  updateDatabaseSchema,
} from '@linode/validation/lib/databases.schema';
import { BETA_API_ROOT as API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { Filter, Params, ResourcePage as Page } from '../types';
import {
  CreateDatabasePayload,
  Database,
  DatabaseInstance,
  DatabaseBackup,
  DatabaseCredentials,
  DatabaseType,
  DatabaseEngine,
  Engine,
  SSLFields,
  UpdateDatabasePayload,
  DatabaseFork,
  DatabaseEngineConfig,
} from './types';

/**
 * getDatabases
 *
 * Return a paginated list of databases on this account.
 *
 */
export const getDatabases = (params?: Params, filter?: Filter) =>
  Request<Page<DatabaseInstance>>(
    setURL(`${API_ROOT}/databases/instances`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getDatabaseTypes
 *
 * Return a paginated list of available plans/types for databases
 *
 */
export const getDatabaseTypes = (params?: Params, filter?: Filter) =>
  Request<Page<DatabaseType>>(
    setURL(`${API_ROOT}/databases/types`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getDatabaseType
 *
 * Return information for a single database type
 *
 */
export const getDatabaseType = (typeSlug: string) =>
  Request<DatabaseType>(
    setURL(`${API_ROOT}/databases/types/${encodeURIComponent(typeSlug)}`),
    setMethod('GET'),
  );

/**
 * getVersions
 *
 * Return information on available versions per engine that we offer
 *
 */
export const getDatabaseEngines = (params?: Params, filter?: Filter) =>
  Request<Page<DatabaseEngine>>(
    setURL(`${API_ROOT}/databases/engines`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getVersion
 *
 * Return information on a specified version
 *
 */
export const getDatabaseEngine = (engineSlug: string) =>
  Request<DatabaseEngine>(
    setURL(`${API_ROOT}/databases/engines/${encodeURIComponent(engineSlug)}`),
    setMethod('GET'),
  );

/**
 * createDatabase
 *
 * Create a new database in the specified region.
 *
 */
export const createDatabase = (
  engine: Engine = 'mysql',
  data: CreateDatabasePayload,
) =>
  Request<Database>(
    setURL(`${API_ROOT}/databases/${encodeURIComponent(engine)}/instances`),
    setMethod('POST'),
    setData(data, createDatabaseSchema),
  );

/**
 * getEngineDatabases
 *
 * Return a paginated list of active engine-specific (e.g. MySQL) databases belonging to user
 *
 */
export const getEngineDatabases = (
  engine: Engine,
  params?: Params,
  filter?: Filter,
) =>
  Request<Page<Database>>(
    setURL(`${API_ROOT}/databases/${encodeURIComponent(engine)}/instances`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getEngineDatabase
 *
 * Return details for a single specified active database
 *
 */
export const getEngineDatabase = (engine: Engine, databaseID: number) =>
  Request<Database>(
    setURL(
      `${API_ROOT}/databases/${encodeURIComponent(
        engine,
      )}/instances/${encodeURIComponent(databaseID)}`,
    ),
    setMethod('GET'),
  );

/**
 * updateDatabase
 *
 * Update the label or allowed IPs or plan of an
 * existing database
 *
 */
export const updateDatabase = (
  engine: Engine,
  databaseID: number,
  data: UpdateDatabasePayload,
) =>
  Request<Database>(
    setURL(
      `${API_ROOT}/databases/${encodeURIComponent(
        engine,
      )}/instances/${encodeURIComponent(databaseID)}`,
    ),
    setMethod('PUT'),
    setData(data, updateDatabaseSchema),
  );

/**
 * patchDatabase
 *
 * Patch security updates for the database (outside of the maintenance window)
 */
export const patchDatabase = (engine: Engine, databaseID: number) =>
  Request<void>(
    setURL(
      `${API_ROOT}/databases/${encodeURIComponent(
        engine,
      )}/instances/${encodeURIComponent(databaseID)}/patch`,
    ),
    setMethod('POST'),
  );

/**
 * deleteDatabase
 *
 * Delete a single database
 */
export const deleteDatabase = (engine: Engine, databaseID: number) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/databases/${encodeURIComponent(
        engine,
      )}/instances/${encodeURIComponent(databaseID)}`,
    ),
    setMethod('DELETE'),
  );

/**
 * getDatabaseBackups
 *
 * Return backups information for a database
 *
 */
export const getDatabaseBackups = (
  engine: Engine,
  databaseID: number,
  params?: Params,
  filter?: Filter,
) =>
  Request<Page<DatabaseBackup>>(
    setURL(
      `${API_ROOT}/databases/${encodeURIComponent(
        engine,
      )}/instances/${encodeURIComponent(databaseID)}/backups`,
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getDatabaseBackups
 *
 * Return details for a specific database backup
 *
 */
export const getDatabaseBackup = (
  engine: Engine,
  databaseID: number,
  backupID: number,
) =>
  Request<DatabaseBackup>(
    setURL(
      `${API_ROOT}/databases/${encodeURIComponent(
        engine,
      )}/instances/${encodeURIComponent(
        databaseID,
      )}/backups/${encodeURIComponent(backupID)}`,
    ),
    setMethod('GET'),
  );

/**
 * legacyRestoreWithBackup
 *
 * Fully restore a backup to the cluster
 */
export const legacyRestoreWithBackup = (
  engine: Engine,
  databaseID: number,
  backupID: number,
) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/databases/${encodeURIComponent(
        engine,
      )}/instances/${encodeURIComponent(
        databaseID,
      )}/backups/${encodeURIComponent(backupID)}/restore`,
    ),
    setMethod('POST'),
  );

/**
 * restoreWithBackup for the New Database
 *
 * Fully restore a backup to the cluster
 */
export const restoreWithBackup = (engine: Engine, fork: DatabaseFork) =>
  Request<Database>(
    setURL(`${API_ROOT}/databases/${encodeURIComponent(engine)}/instances`),
    setMethod('POST'),
    setData({ fork }),
  );

/**
 * getDatabaseCredentials
 *
 * Return credentials (root username and password) for a database
 *
 */
export const getDatabaseCredentials = (engine: Engine, databaseID: number) =>
  Request<DatabaseCredentials>(
    setURL(
      `${API_ROOT}/databases/${encodeURIComponent(
        engine,
      )}/instances/${encodeURIComponent(databaseID)}/credentials`,
    ),
    setMethod('GET'),
  );

/**
 * resetDatabaseCredentials
 *
 * Resets the root credentials for a database
 */
export const resetDatabaseCredentials = (engine: Engine, databaseID: number) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/databases/${encodeURIComponent(
        engine,
      )}/instances/${encodeURIComponent(databaseID)}/credentials/reset`,
    ),
    setMethod('POST'),
  );

/**
 * getSSLFields
 *
 * Retrieve the certificate and public key for a database instance
 */
export const getSSLFields = (engine: Engine, databaseID: number) =>
  Request<SSLFields>(
    setURL(
      `${API_ROOT}/databases/${encodeURIComponent(
        engine,
      )}/instances/${encodeURIComponent(databaseID)}/ssl`,
    ),
    setMethod('GET'),
  );

/**
 * suspendDatabase
 *
 * Suspend the specified database cluster
 */
export const suspendDatabase = (engine: Engine, databaseID: number) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/databases/${encodeURIComponent(
        engine,
      )}/instances/${encodeURIComponent(databaseID)}/suspend`,
    ),
    setMethod('POST'),
  );

/**
 * resumeDatabase
 *
 * Resume the specified database cluster
 */
export const resumeDatabase = (engine: Engine, databaseID: number) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/databases/${encodeURIComponent(
        engine,
      )}/instances/${encodeURIComponent(databaseID)}/resume`,
    ),
    setMethod('POST'),
  );

/**
 * getConfig
 *
 * Return detailed list of all the configuration options
 *
 */
export const getDatabaseEngineConfig = (engine: Engine) =>
  Request<DatabaseEngineConfig>(
    setURL(`${API_ROOT}/databases/${encodeURIComponent(engine)}/config`),
    setMethod('GET'),
  );
