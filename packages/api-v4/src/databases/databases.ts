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
 * Create a new MySQL database in the specified region.
 *
 */
export const createDatabase = (data: CreateDatabasePayload) =>
  Request<CreateDatabaseResponse>(
    setURL(`${API_ROOT}/databases/mysql/instances`),
    setMethod('POST'),
    setData(data, createDatabaseSchema)
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
export const updateMySQLDatabase = (
  databaseID: number,
  data: UpdateDatabasePayload
) =>
  Request<UpdateDatabaseResponse>(
    setURL(`${API_ROOT}/databases/mysql/instances/${databaseID}`),
    setMethod('PUT'),
    setData(data, updateDatabaseSchema)
  );

/**
 * deleteDatabase
 *
 * Delete a single database
 */
export const deleteDatabase = (databaseID: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/databases/mysql/instances/${databaseID}`),
    setMethod('DELETE')
  );

/**
 * getDatabaseBackups
 *
 * Return backups information for a database
 *
 */
export const getDatabaseBackups = (databaseID: number) =>
  Request<Page<DatabaseBackup>>(
    setURL(`${API_ROOT}/databases/mysql/instances/${databaseID}/backups`),
    setMethod('GET')
  );

/**
 * getDatabaseBackups
 *
 * Return details for a specific database backup
 *
 */
export const getDatabaseBackup = (databaseID: number, backupID: number) =>
  Request<DatabaseBackup>(
    setURL(
      `${API_ROOT}/databases/mysql/instances/${databaseID}/backups/${backupID}`
    ),
    setMethod('GET')
  );

/**
 * restoreWithBackup
 *
 * Fully restore a backup to the cluster
 */
export const restoreWithBackup = (databaseID: number, backupID: number) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/databases/mysql/instances/${databaseID}/backups/${backupID}/restore`
    ),
    setMethod('POST')
  );

/**
 * getDatabaseCredentials
 *
 * Return credentials (root username and password) for a database
 *
 */
export const getDatabaseCredentials = (databaseID: number) =>
  Request<DatabaseCredentials>(
    setURL(`${API_ROOT}/databases/mysql/instances/${databaseID}/credentials`),
    setMethod('GET')
  );

/**
 * resetDatabaseCredentials
 *
 * Resets the root credentials for a database
 */
export const resetDatabaseCredentials = (databaseID: number) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/databases/mysql/instances/${databaseID}/credentials/reset`
    ),
    setMethod('POST')
  );

/**
 * getSSLFields
 *
 * Retrieve the certificate and public key for a database instance
 */
export const getSSLFields = (databaseID: number) =>
  Request<SSLFields>(
    setURL(`${API_ROOT}/databases/mysql/instances/${databaseID}/ssl`),
    setMethod('GET')
  );
