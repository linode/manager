import {
  getDatabaseEngines,
  getDatabaseTypes,
  getDatabases,
} from '@linode/api-v4';

import { getAll } from 'src/utilities/getAll';

import type {
  DatabaseEngine,
  DatabaseInstance,
  DatabaseType,
  Filter,
  Params,
} from '@linode/api-v4';

export const getAllDatabases = () =>
  getAll<DatabaseInstance>((params) => getDatabases(params))().then(
    (data) => data.data
  );

export const getAllDatabaseEngines = () =>
  getAll<DatabaseEngine>((params) => getDatabaseEngines(params))().then(
    (data) => data.data
  );

export const getAllDatabaseTypes = () =>
  getAll<DatabaseType>((params) => getDatabaseTypes(params))().then(
    (data) => data.data
  );

/**
 * This method accepts params and xFilters as input and get all database instances, followed the existing standards
 * @param passedParams - The parameters like pagination information etc.,
 * @param passedFilter - The xFilters to be applied in the API
 * @returns - List of DatabaseInstance
 */
export const getAllDatabasesWithFilters = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<DatabaseInstance>((params, filter) =>
    getDatabases({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);
