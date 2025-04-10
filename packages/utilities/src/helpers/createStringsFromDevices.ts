import type {
  Devices,
  DiskDevice,
  VolumeDevice,
} from '@linode/api-v4/lib/linodes';
import type { DevicesAsStrings } from './createDevicesFromStrings';

const rdx = (
  result: DevicesAsStrings,
  [key, device]: [string, DiskDevice | VolumeDevice | null]
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

const isDisk = (device: DiskDevice | VolumeDevice): device is DiskDevice => {
  return typeof (device as DiskDevice).disk_id === 'number';
};
const isVolume = (
  device: DiskDevice | VolumeDevice
): device is VolumeDevice => {
  return typeof (device as VolumeDevice).volume_id === 'number';
};

export const createStringsFromDevices = (devices: Devices) =>
  Object.entries(devices).reduce(rdx, {});
