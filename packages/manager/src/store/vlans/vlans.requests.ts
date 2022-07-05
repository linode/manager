import { VLAN, getVlans } from '@linode/api-v4';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers.tmp';
import { getVlansActions } from './vlans.actions';

const getAllVlansRequest = (payload?: { params?: any; filter?: any }) =>
  getAll<VLAN>((passedParams, passedFilter) =>
    getVlans(passedParams, passedFilter)
  )(payload?.params, payload?.filter);

export const getAllVlans = createRequestThunk(
  getVlansActions,
  getAllVlansRequest
);
