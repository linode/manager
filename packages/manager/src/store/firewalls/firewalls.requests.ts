import { Firewall, getFirewalls } from 'linode-js-sdk/lib/firewalls';
import { firewalls as mockFirewalls } from 'src/__data__/firewalls';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { getFirewalls as _getFirewallsAction } from './firewalls.actions';

const getAllFirewallsRequest = (payload: { params?: any; filter?: any }) =>
  getAll<Firewall>((passedParams, passedFilter) =>
    getFirewalls(mockFirewalls, passedParams, passedFilter)
  )(payload.params, payload.filter);

export const getAllFirewalls = createRequestThunk(
  _getFirewallsAction,
  getAllFirewallsRequest
);
