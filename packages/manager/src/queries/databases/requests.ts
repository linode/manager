import {
  getDatabaseEngines,
  getDatabaseTypes,
  getDatabases,
} from '@linode/api-v4';
import { DatabaseEngine, DatabaseInstance, DatabaseType } from '@linode/api-v4';

import { getAll } from 'src/utilities/getAll';

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
