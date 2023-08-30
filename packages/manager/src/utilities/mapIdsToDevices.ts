import { Linode, NodeBalancer } from '@linode/api-v4';

import { isNotNullOrUndefined } from './nullOrUndefined';

type Device = Linode | NodeBalancer;

export const mapIdsToDevices = (
  ids: null | number | number[],
  devices: Device[] = []
): Device | Device[] | null => {
  const deviceMap = new Map(devices.map((device) => [device.id, device]));
  if (Array.isArray(ids)) {
    return ids.map((id) => deviceMap.get(id)).filter(isNotNullOrUndefined);
  } else if (ids !== null) {
    return deviceMap.get(ids) ?? null;
  } else {
    return null;
  }
};
