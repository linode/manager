import { BETA_API_ROOT as API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from 'src/request';
import { ResourcePage as Page } from '../types';

import {
  createDatabaseSchema,
  resetPasswordSchema,
  updateDatabaseSchema
} from './databases.schema';

import {
  CreateDatabasePayload,
  Database,
  DatabaseConnection,
  DatabaseType,
  UpdateDatabasePayload
} from './types';

/**
 * getDatabases
 *
 * Return a paginated list of managed databases on this account.
 *
 */
export const getDatabases = (params?: any, filters?: any) =>
  Request<Page<Database>>(
    setURL(`${API_ROOT}/databases/mysql/instances`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );

/**
 * getDatabase
 *
 * Return detailed information about a single database
 *
 */
export const getDatabase = (databaseID: number) =>
  Request<Database>(
    setURL(`${API_ROOT}/databases/mysql/instances/${databaseID}`),
    setMethod('GET')
  );

/**
 * getDatabaseConnection
 *
 * Return connection information (host and port) for a database
 *
 */
export const getDatabaseConnection = (databaseID: number) =>
  Request<DatabaseConnection>(
    setURL(`${API_ROOT}/databases/mysql/instances/${databaseID}/connection`),
    setMethod('GET')
  );

/**
 * getMySQLTypes
 *
 * Return a paginated list of available plans/types for MySQL databases
 *
 */
export const getMySQLTypes = (params?: any, filters?: any) =>
  Request<Page<DatabaseType>>(
    setURL(`${API_ROOT}/databases/mysql/types`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );

/**
 * createDatabase
 *
 * Create a new MySQL database in the specified region.
 *
 */
export const createDatabase = (data: CreateDatabasePayload) =>
  Request<Database>(
    setURL(`${API_ROOT}/databases/mysql/instances`),
    setMethod('POST'),
    setData(data, createDatabaseSchema)
  );

/**
 * updateDatabase
 *
 * Update the label, tags, or maintenance schedule of an
 * existing database
 *
 */
export const updateDatabase = (
  databaseID: number,
  data: UpdateDatabasePayload
) =>
  Request<Database>(
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
 * resetDatabasePassword
 *
 * Resets the root password for a database
 */
export const resetPassword = (databaseID: number, root_password: string) =>
  Request<{}>(
    setURL(`${API_ROOT}/databases/mysql/instances/${databaseID}/password`),
    setMethod('PUT'),
    setData({ root_password }, resetPasswordSchema)
  );
