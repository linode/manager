import { getLongviewClients, LongviewClient } from 'linode-js-sdk/lib/longview';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { getLongviewClients as _getLongviewClientsActions } from './longview.actions';

const _getAllLongviewClients = (payload: { params?: any; filter?: any }) =>
  getAll<LongviewClient>((passedParams, passedFilter) =>
    getLongviewClients(passedParams, passedFilter)
  )(payload.params, payload.filter);

export const getAllLongviewClients = createRequestThunk(
  _getLongviewClientsActions,
  _getAllLongviewClients
);
