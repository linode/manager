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
  CreateDatabasePayload,
  Database,
  DatabaseConnection,
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
  Request<Page<Database>>(
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
 * createDatabase
 *
 * Create a new MySQL database in the specified region.
 *
 */
export const createDatabase = (data: CreateDatabasePayload) =>
  Request<Database>(
    setURL(`${API_ROOT}/databases/mysql/instances`),
    setMethod('POST'),
    setData(data)
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
    setData(data)
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
