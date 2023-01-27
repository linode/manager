import { Devices } from '@linode/api-v4/lib/linodes';
import { isNil, split } from 'ramda';

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
const createTypeRecord = (value?: string): null | DiskRecord | VolumeRecord => {
  if (isNil(value) || value === 'none') {
    return null;
  }

  // Given: volume-123
  const [type, id] = split('-', value) as ['volume' | 'disk', number]; // -> [volume, 123]

  const key = `${type}_id` as 'volume_id' | 'disk_id'; // -> `volume_id`
  const idAsNumber = Number(id); // -> 123

  return { [key]: idAsNumber } as DiskRecord | VolumeRecord; // -> { volume_id: 123 }
};

const createDevicesFromStrings = (devices: DevicesAsStrings): Devices => ({
  sda: createTypeRecord(devices.sda),
  sdb: createTypeRecord(devices.sdb),
  sdc: createTypeRecord(devices.sdc),
  sdd: createTypeRecord(devices.sdd),
  sde: createTypeRecord(devices.sde),
  sdf: createTypeRecord(devices.sdf),
  sdg: createTypeRecord(devices.sdg),
  sdh: createTypeRecord(devices.sdh),
});

export default createDevicesFromStrings;
