import { isNotNullOrUndefined } from '../helpers';

import type { Linode, NodeBalancer } from '@linode/api-v4';

type Device = Linode | NodeBalancer;

export const mapIdsToDevices = <T extends Device>(
  ids: null | number | number[],
  devices: T[] = [],
): T | T[] | null => {
  const deviceMap = new Map(
    // Even though the types extend Device. type insertion is still required here
    devices.map((device) => [device.id, device]),
  );
  if (Array.isArray(ids)) {
    return ids.map((id) => deviceMap.get(id)).filter(isNotNullOrUndefined);
  } else if (ids !== null) {
    return deviceMap.get(ids) ?? null;
  } else {
    return null;
  }
};
