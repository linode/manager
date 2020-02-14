import {
  createFirewall as _create,
  Firewall,
  getFirewalls
} from 'linode-js-sdk/lib/firewalls';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import {
  createFirewallActions,
  getFirewalls as _getFirewallsAction
} from './firewalls.actions';

const getAllFirewallsRequest = (payload: { params?: any; filter?: any }) =>
  getAll<Firewall>((passedParams, passedFilter) =>
    getFirewalls(passedParams, passedFilter)
  )(payload.params, payload.filter);

export const getAllFirewalls = createRequestThunk(
  _getFirewallsAction,
  getAllFirewallsRequest
);

export const createFirewall = createRequestThunk(
  createFirewallActions,
  _create
);
