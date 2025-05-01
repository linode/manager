import {
  getDatabaseEngines,
  getDatabases,
  getDatabaseTypes,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';

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
  getAll<DatabaseInstance>((params, filter) =>
    getDatabases({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

export const getAllDatabaseEngines = () =>
  getAll<DatabaseEngine>((params) => getDatabaseEngines(params))().then(
    (data) => data.data
  );

export const getAllDatabaseTypes = (passedFilter: Filter = {}) =>
  getAll<DatabaseType>((params, filter) =>
    getDatabaseTypes(params, { ...filter, ...passedFilter })
  )().then((data) => data.data);
