import {
  createVlan as _create,
  deleteVlan as _delete,
  VLAN,
  getVlans,
  connectVlan as _connect,
  disconnectVlan as _disconnect
} from '@linode/api-v4/lib/vlans';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers.tmp';
import {
  createVlanActions,
  deleteVlanActions,
  getVlansActions,
  connectVlanActions,
  disconnectVlanActions
} from './vlans.actions';

const getAllVlansRequest = (payload?: { params?: any; filter?: any }) =>
  getAll<VLAN>((passedParams, passedFilter) =>
    getVlans(passedParams, passedFilter)
  )(payload?.params, payload?.filter);

export const getAllVlans = createRequestThunk(
  getVlansActions,
  getAllVlansRequest
);

export const createVlan = createRequestThunk(createVlanActions, _create);
export const deleteVlan = createRequestThunk(deleteVlanActions, ({ vlanID }) =>
  _delete(vlanID)
);

export const connectVlan = createRequestThunk(
  connectVlanActions,
  ({ vlanID, linodes }) => _connect(vlanID, linodes)
);

export const disconnectVlan = createRequestThunk(
  disconnectVlanActions,
  ({ vlanID, linodes }) => _disconnect(vlanID, linodes)
);
