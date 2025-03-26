import { Devices } from '@linode/api-v4/lib/linodes';

type DiskRecord = Record<'disk_id', number>;

type VolumeRecord = Record<'volume_id', number>;

export interface DevicesAsStrings {
  sda?: string;
  sdb?: string;
  sdc?: string;
  sdd?: string;
  sde?: string;
  sdf?: string;
  sdg?: string;
  sdh?: string;
}

/**
 * The `value` should be formatted as volume-123, disk-123, etc.,
 */
const createTypeRecord = (value?: string): DiskRecord | VolumeRecord | null => {
  if (value === null || value === undefined || value === 'none') {
    return null;
  }

  // Given: volume-123
  const [type, id] = value.split('-'); // -> [volume, 123]

  if (type !== 'volume' && type !== 'disk') {
    return null;
  }

  const key = `${type}_id` as const; // -> `volume_id`
  const idAsNumber = Number(id); // -> 123

  return { [key]: idAsNumber } as DiskRecord | VolumeRecord; // -> { volume_id: 123 }
};

export const createDevicesFromStrings = (
  devices: DevicesAsStrings
): Devices => ({
  sda: createTypeRecord(devices.sda),
  sdb: createTypeRecord(devices.sdb),
  sdc: createTypeRecord(devices.sdc),
  sdd: createTypeRecord(devices.sdd),
  sde: createTypeRecord(devices.sde),
  sdf: createTypeRecord(devices.sdf),
  sdg: createTypeRecord(devices.sdg),
  sdh: createTypeRecord(devices.sdh),
});
