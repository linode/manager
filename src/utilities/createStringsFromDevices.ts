import { compose, reduce, toPairs } from 'ramda';

import { DevicesAsStrings } from 'src/utilities/createDevicesFromStrings';

const rdx = (
  result: DevicesAsStrings,
  [key, device]: [string, null | Linode.DiskDevice | Linode.VolumeDevice]) => {

  if (isDisk(device)) {
    return { ...result, [key]: `disk-${device.disk_id}` };
  }

  if (isVolume(device)) {
    return { ...result, [key]: `volume-${device.volume_id}` };
  }

  return result;
};

function isDisk(d: null | Linode.DiskDevice | Linode.VolumeDevice): d is Linode.DiskDevice {
  return d !== null && (<Linode.DiskDevice>d).disk_id !== undefined;
}
function isVolume(d: null | Linode.DiskDevice | Linode.VolumeDevice): d is Linode.VolumeDevice {
  return d !== null && (<Linode.VolumeDevice>d).volume_id !== undefined;
}

export default compose(
  reduce(rdx, {}),
  toPairs,
);
