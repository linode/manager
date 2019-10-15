import {
  createLongviewClient as _create,
  deleteLongviewClient as _delete,
  getLongviewClients,
  LongviewClient
} from 'linode-js-sdk/lib/longview';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import {
  createLongviewClient as _createLongviewClientActions,
  deleteLongviewClient as _deleteLongviewClientActions,
  getLongviewClients as _getLongviewClientsActions
} from './longview.actions';

const _getAllLongviewClients = (payload: { params?: any; filter?: any }) =>
  getAll<LongviewClient>((passedParams, passedFilter) =>
    getLongviewClients(passedParams, passedFilter)
  )(payload.params, payload.filter);

export const getAllLongviewClients = createRequestThunk(
  _getLongviewClientsActions,
  _getAllLongviewClients
);

export const createLongviewClient = createRequestThunk(
  _createLongviewClientActions,
  ({ label }) => _create(label)
);

export const deleteLongviewClient = createRequestThunk(
  _deleteLongviewClientActions,
  ({ id }) => _delete(id)
);
