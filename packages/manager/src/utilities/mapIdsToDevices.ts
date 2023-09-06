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

// type Device = Linode | NodeBalancer;

// export const mapIdsToDevices = <T extends Device>(
//   ids: null | number | number[],
//   devices: T[] = []
// ): T | T[] | null => {
//   const deviceMap = new Map(
//     // Even though the types extend Device. type insertion is still required here
//     devices.map((device) => [(device as Device).id, device])
//   );
//   if (Array.isArray(ids)) {
//     return ids.map((id) => deviceMap.get(id)).filter(isNotNullOrUndefined);
//   } else if (ids !== null) {
//     return deviceMap.get(ids) ?? null;
//   } else {
//     return null;
//   }
// };
