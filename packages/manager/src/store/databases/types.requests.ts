import {
  getMySQLTypes as _get,
  DatabaseType
} from '@linode/api-v4/lib/databases';
import { getAllWithArguments } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers.tmp';
import { getDatabaseTypesActions } from './types.actions';

const typesRequest = (payload?: { params?: any; filter?: any }) =>
  getAllWithArguments<DatabaseType>((passedParams, passedFilter) =>
    _get(passedParams, passedFilter)
  )(payload?.params, payload?.filter);

export const getAllMySQLTypes = createRequestThunk(
  getDatabaseTypesActions,
  typesRequest
);
