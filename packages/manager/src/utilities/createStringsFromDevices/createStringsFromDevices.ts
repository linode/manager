import { compose, reduce, toPairs } from 'ramda';

import { DevicesAsStrings } from 'src/utilities/createDevicesFromStrings';

const rdx = (
  result: DevicesAsStrings,
  [key, device]: [string, null | Linode.DiskDevice | Linode.VolumeDevice]
) => {
  if (device === null) {
    return result;
  }

  if (isDisk(device)) {
    return { ...result, [key]: `disk-${device.disk_id}` };
  }

  if (isVolume(device)) {
    return { ...result, [key]: `volume-${device.volume_id}` };
  }

  return result;
};

const isDisk = (
  device: Linode.DiskDevice | Linode.VolumeDevice
): device is Linode.DiskDevice => {
  return typeof (device as Linode.DiskDevice).disk_id === 'number';
};
const isVolume = (
  device: Linode.DiskDevice | Linode.VolumeDevice
): device is Linode.VolumeDevice => {
  return typeof (device as Linode.VolumeDevice).volume_id === 'number';
};

export default compose(
  reduce(rdx, {}),
  toPairs
);
