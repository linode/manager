import {
  FirewallDevice,
  FirewallDevicePayload,
} from '@linode/api-v4/lib/firewalls/types';

import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import {
  addFirewallDevice,
  getAllFirewallDevices,
  removeFirewallDevice,
} from 'src/store/firewalls/devices.requests';
import {
  EntityError,
  MappedEntityState2,
  ThunkDispatch,
} from 'src/store/types';

export interface UseDevicesProps {
  devices: MappedEntityState2<FirewallDevice, EntityError>;
  addDevice: (newDevice: FirewallDevicePayload) => Promise<FirewallDevice>;
  removeDevice: (deviceID: number) => Promise<{}>;
  requestDevices: () => Promise<FirewallDevice[] | null>;
}

const defaultState: MappedEntityState2<FirewallDevice, EntityError> = {
  loading: false,
  lastUpdated: 0,
  itemsById: {},
  error: {},
  results: 0,
};

/**
 * Hook for viewing and working with Firewall devices
 */
export const useFirewallDevices = (firewallID: number): UseDevicesProps => {
  const dispatch: ThunkDispatch = useDispatch();
  const devices = useSelector(
    (state: ApplicationState) =>
      state.firewallDevices[firewallID] ?? { ...defaultState }
  );
  const requestDevices = () =>
    dispatch(getAllFirewallDevices({ firewallID }))
      .then((response) => response.data)
      .catch((_) => null); // Handle errors through Redux
  const addDevice = (newDevice: FirewallDevicePayload) =>
    dispatch(addFirewallDevice({ firewallID, ...newDevice }));
  const removeDevice = (deviceID: number) =>
    dispatch(removeFirewallDevice({ firewallID, deviceID }));

  return { devices, requestDevices, addDevice, removeDevice };
};

export default useFirewallDevices;
