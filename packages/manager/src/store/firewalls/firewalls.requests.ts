import {
  createFirewall as _create,
  deleteFirewall as _delete,
  disableFirewall as _disable,
  enableFirewall as _enable,
  Firewall,
  getFirewalls,
  updateFirewall as _update,
  updateFirewallRules as _updateRules,
} from '@linode/api-v4/lib/firewalls';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import {
  createFirewallActions,
  deleteFirewallActions,
  getFirewalls as _getFirewallsAction,
  updateFirewallActions,
  updateFirewallRulesActions,
} from './firewalls.actions';

export const getAllFirewallsRequest = (payload: {
  params?: any;
  filter?: any;
}) =>
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

export const updateFirewall = createRequestThunk(
  updateFirewallActions,
  ({ firewallID, ...data }) => _update(firewallID, data)
);

export const updateFirewallRules = createRequestThunk(
  updateFirewallRulesActions,
  ({ firewallID, ...data }) => _updateRules(firewallID, data)
);

export const enableFirewall = createRequestThunk(
  updateFirewallActions,
  ({ firewallID }) => _enable(firewallID)
);

export const disableFirewall = createRequestThunk(
  updateFirewallActions,
  ({ firewallID }) => _disable(firewallID)
);

export const deleteFirewall = createRequestThunk(
  deleteFirewallActions,
  ({ firewallID }) => _delete(firewallID)
);
