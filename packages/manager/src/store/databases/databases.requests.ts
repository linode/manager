import {
  createDatabase as _create,
  deleteDatabase as _delete,
  Database,
  getDatabases,
  updateDatabase as _update
} from '@linode/api-v4/lib/databases';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers.tmp';
import {
  createDatabaseActions,
  deleteDatabaseActions,
  getDatabasesActions,
  updateDatabaseActions
} from './databases.actions';

const getAllDatabasesRequest = (payload?: { params?: any; filter?: any }) =>
  getAll<Database>((passedParams, passedFilter) =>
    getDatabases(passedParams, passedFilter)
  )(payload?.params, payload?.filter);

export const getAllDatabases = createRequestThunk(
  getDatabasesActions,
  getAllDatabasesRequest
);

export const createDatabase = createRequestThunk(
  createDatabaseActions,
  _create
);

export const deleteDatabase = createRequestThunk(
  deleteDatabaseActions,
  ({ databaseID }) => _delete(databaseID)
);

export const updateDatabase = createRequestThunk(
  updateDatabaseActions,
  ({ databaseID, ...payload }) => _update(databaseID, payload)
);
