import {
  addFirewallDevice as _add,
  deleteFirewallDevice as _delete,
  FirewallDevice,
  getFirewallDevices as _get,
} from '@linode/api-v4/lib/firewalls';
import { getAllWithArguments } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import {
  addFirewallDeviceActions,
  getAllFirewallDevicesActions,
  removeFirewallDeviceActions,
} from './devices.actions';

const requestAll = (payload: {
  firewallID: number;
  params?: any;
  filter?: any;
}) =>
  getAllWithArguments<FirewallDevice>(_get)(
    [payload.firewallID],
    payload.params,
    payload.filter
  );

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
