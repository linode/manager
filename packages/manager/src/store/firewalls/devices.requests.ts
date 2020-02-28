import {
  addFirewallDevice as _add,
  deleteFirewallDevice as _delete,
  FirewallDevice,
  getFirewallDevices as _get
} from 'linode-js-sdk/lib/firewalls';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import {
  addFirewallDeviceActions,
  getAllFirewallDevicesActions,
  GetDevicesPayload,
  removeFirewallDeviceActions
} from './devices.actions';

const requestAll = (payload: GetDevicesPayload) =>
  getAll<FirewallDevice>(({ passedParams, passedFilter }) =>
    _get(payload.firewallID, passedParams, passedFilter)
  )(payload.params, payload.filters);

export const getAllFirewallDevices = createRequestThunk(
  getAllFirewallDevicesActions,
  requestAll
);

export const addFirewallDevice = createRequestThunk(
  addFirewallDeviceActions,
  ({ firewallID, ...rest }) => _add(firewallID, { ...rest })
);

export const removeFirewallDevice = createRequestThunk(
  removeFirewallDeviceActions,
  ({ firewallID, deviceID }) => _delete(firewallID, deviceID)
);
