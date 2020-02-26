import { FirewallDevicePayload } from 'linode-js-sdk/lib/firewalls/types';

import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import {
  addFirewallDevice,
  getAllFirewallDevices,
  removeFirewallDevice
} from 'src/store/firewalls/devices.requests';

/**
 * Hook for viewing and working with Firewall devices
 */
export const useFirewallDevices = (firewallID: number) => {
  const dispatch = useDispatch();
  const devices = useSelector(
    (state: ApplicationState) => state.firewallDevices[firewallID]
  );
  const requestDevices = () => dispatch(getAllFirewallDevices({ firewallID }));
  const addDevice = (newDevice: FirewallDevicePayload) =>
    dispatch(addFirewallDevice({ firewallID, ...newDevice }));
  const removeDevice = (deviceID: number) =>
    dispatch(removeFirewallDevice({ firewallID, deviceID }));

  return { devices, requestDevices, addDevice, removeDevice };
};

export default useFirewallDevices;
