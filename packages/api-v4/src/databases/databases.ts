import {
  createDatabaseSchema,
  updateDatabaseSchema,
} from '@linode/validation/lib/databases.schema';
import { BETA_API_ROOT as API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from 'src/request';
import { ResourcePage as Page } from '../types';
import {
  CreateDatabasePayload,
  CreateDatabaseResponse,
  Database,
  DatabaseBackup,
  DatabaseCredentials,
  DatabaseType,
  DatabaseVersion,
  Engine,
  SSLFields,
  UpdateDatabasePayload,
  UpdateDatabaseResponse,
} from './types';

/**
 * getDatabases
 *
 * Return a paginated list of databases on this account.
 *
 */
export const getDatabases = (params?: any, filters?: any) =>
  Request<Page<Database>>(
    setURL(`${API_ROOT}/databases/instances`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );

/**
 * getDatabaseTypes
 *
 * Return a paginated list of available plans/types for databases
 *
 */
export const getDatabaseTypes = (params?: any, filters?: any) =>
  Request<Page<DatabaseType>>(
    setURL(`${API_ROOT}/databases/types`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );

/**
 * getDatabaseType
 *
 * Return information for a single database type
 *
 */
export const getDatabaseType = (typeSlug: number) =>
  Request<DatabaseType>(
    setURL(`${API_ROOT}/databases/types/${typeSlug}`),
    setMethod('GET')
  );

/**
 * getVersions
 *
 * Return information on available versions per engine that we offer
 *
 */
export const getDatabaseVersions = (params?: any, filters?: any) =>
  Request<Page<DatabaseVersion>>(
    setURL(`${API_ROOT}/databases/versions`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );

/**
 * getVersion
 *
 * Return information on a specified version
 *
 */
export const getDatabaseVersion = (versionSlug: string) =>
  Request<DatabaseVersion>(
    setURL(`${API_ROOT}/databases/versions/${versionSlug}`),
    setMethod('GET')
  );

/**
 * createDatabase
 *
 * Create a new database in the specified region.
 *
 */
export const createDatabase = (engine: Engine, data: CreateDatabasePayload) =>
  Request<CreateDatabaseResponse>(
    setURL(`${API_ROOT}/databases/${engine}/instances`),
    setMethod('POST'),
    setData(data, createDatabaseSchema)
  );

/**
 * getEngineDatabases
 *
 * Return a paginated list of active engine-specific (e.g. MySQL) databases belonging to user
 *
 */
export const getEngineDatabases = (
  engine: Engine,
  params?: any,
  filters?: any
) =>
  Request<Page<Database>>(
    setURL(`${API_ROOT}/databases/${engine}/instances`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );

/**
 * getEngineDatabase
 *
 * Return details for a single specified active database
 *
 */
export const getEngineDatabase = (engine: Engine, databaseID: number) =>
  Request<Database>(
    setURL(`${API_ROOT}/databases/${engine}/instances/${databaseID}`),
    setMethod('GET')
  );

/**
 * getMySQLDatabases
 *
 * Return a paginated list of active MySQL databases belonging to user
 *
 */
export const getMySQLDatabases = (params?: any, filters?: any) =>
  Request<Page<Database>>(
    setURL(`${API_ROOT}/databases/mysql/instances`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );

/**
 * getMySQLDatabase
 *
 * Return details for a specific active MySQL database
 *
 */
export const getMySQLDatabase = (mysqlDatabaseID: number) =>
  Request<Database>(
    setURL(`${API_ROOT}/databases/mysql/instances/${mysqlDatabaseID}`),
    setMethod('GET')
  );

/**
 * updateDatabase
 *
 * Update the label or allowed IPs of an
 * existing database
 *
 */
export const updateDatabase = (
  engine: Engine,
  databaseID: number,
  data: UpdateDatabasePayload
) =>
  Request<UpdateDatabaseResponse>(
    setURL(`${API_ROOT}/databases/${engine}/instances/${databaseID}`),
    setMethod('PUT'),
    setData(data, updateDatabaseSchema)
  );

/**
 * deleteDatabase
 *
 * Delete a single database
 */
export const deleteDatabase = (engine: Engine, databaseID: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/databases/${engine}/instances/${databaseID}`),
    setMethod('DELETE')
  );

/**
 * getDatabaseBackups
 *
 * Return backups information for a database
 *
 */
export const getDatabaseBackups = (engine: Engine, databaseID: number) =>
  Request<Page<DatabaseBackup>>(
    setURL(`${API_ROOT}/databases/${engine}/instances/${databaseID}/backups`),
    setMethod('GET')
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
  backupID: number
) =>
  Request<DatabaseBackup>(
    setURL(
      `${API_ROOT}/databases/${engine}/instances/${databaseID}/backups/${backupID}`
    ),
    setMethod('GET')
  );

/**
 * restoreWithBackup
 *
 * Fully restore a backup to the cluster
 */
export const restoreWithBackup = (
  engine: Engine,
  databaseID: number,
  backupID: number
) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/databases/${engine}/instances/${databaseID}/backups/${backupID}/restore`
    ),
    setMethod('POST')
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
      `${API_ROOT}/databases/${engine}/instances/${databaseID}/credentials`
    ),
    setMethod('GET')
  );

/**
 * resetDatabaseCredentials
 *
 * Resets the root credentials for a database
 */
export const resetDatabaseCredentials = (engine: Engine, databaseID: number) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/databases/${engine}/instances/${databaseID}/credentials/reset`
    ),
    setMethod('POST')
  );

/**
 * getSSLFields
 *
 * Retrieve the certificate and public key for a database instance
 */
export const getSSLFields = (engine: Engine, databaseID: number) =>
  Request<SSLFields>(
    setURL(`${API_ROOT}/databases/${engine}/instances/${databaseID}/ssl`),
    setMethod('GET')
  );
