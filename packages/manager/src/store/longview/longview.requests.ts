import {
  createLongviewClient as _create,
  deleteLongviewClient as _delete,
  getLongviewClients,
  updateLongviewClient as update,
} from '@linode/api-v4/lib/longview';
import { getAll } from '@linode/utilities';

import { createRequestThunk } from '../store.helpers';
import {
  createLongviewClient as _createLongviewClientActions,
  deleteLongviewClient as _deleteLongviewClientActions,
  getLongviewClients as _getLongviewClientsActions,
  updateLongviewClient as _updateLongviewClientActions,
} from './longview.actions';

import type { Filter, Params } from '@linode/api-v4';
import type { LongviewClient } from '@linode/api-v4/lib/longview';

const _getAllLongviewClients = (payload: {
  filter?: Filter;
  params?: Params;
}) =>
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

export const updateLongviewClient = createRequestThunk(
  _updateLongviewClientActions,
  ({ id, label }) => update(id, label)
);
