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

export const getAllDatabases = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<DatabaseInstance>(
    (params, filter) =>
      getDatabases(
        { ...params, ...passedParams },
        { ...filter, ...passedFilter }
      ),
    100 // DBaaS supports a maximum of 100 page per call
  )().then((data) => data.data);

export const getAllDatabaseEngines = () =>
  getAll<DatabaseEngine>((params) => getDatabaseEngines(params))().then(
    (data) => data.data
  );

export const getAllDatabaseTypes = () =>
  getAll<DatabaseType>((params) => getDatabaseTypes(params))().then(
    (data) => data.data
  );
