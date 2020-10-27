import {
  createVlan as _create,
  deleteVlan as _delete,
  VLAN,
  getVlans,
  attachVlan as _attach,
  detachVlan as _detach
} from '@linode/api-v4/lib/vlans';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers.tmp';
import {
  createVlanActions,
  deleteVlanActions,
  getVlansActions,
  attachVlanActions,
  detachVlanActions
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

export const attachVlan = createRequestThunk(
  attachVlanActions,
  ({ vlanID, linodes }) => _attach(vlanID, linodes)
);

export const detachVlan = createRequestThunk(
  detachVlanActions,
  ({ vlanID, linodes }) => _detach(vlanID, linodes)
);
