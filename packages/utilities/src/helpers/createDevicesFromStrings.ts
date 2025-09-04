import type { Devices } from '@linode/api-v4/lib/linodes';

type DiskRecord = Record<'disk_id', number>;

type VolumeRecord = Record<'volume_id', number>;

/**
 * Maps the Devices type to have optional string values instead of device objects.
 * This allows us to work with string representations like "volume-123" or "disk-456"
 * before converting them to the proper API format.
 */
type StringTypeMap<T> = {
  [key in keyof T]?: string;
};

export type DevicesAsStrings = StringTypeMap<Devices>;

/**
 * Creates a device record from a string representation.
 *
 * Device slots are optional and may not exist
 * in all contexts, so empty slots can be represented as `undefined`.
 */
const createTypeRecord = (
  value?: string,
): DiskRecord | null | undefined | VolumeRecord => {
  if (value === undefined || value === null || value === 'none') {
    return undefined;
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
  devices: DevicesAsStrings,
): Devices => ({
  sda: createTypeRecord(devices.sda),
  sdb: createTypeRecord(devices.sdb),
  sdc: createTypeRecord(devices.sdc),
  sdd: createTypeRecord(devices.sdd),
  sde: createTypeRecord(devices.sde),
  sdf: createTypeRecord(devices.sdf),
  sdg: createTypeRecord(devices.sdg),
  sdh: createTypeRecord(devices.sdh),
  sdi: createTypeRecord(devices.sdi),
  sdj: createTypeRecord(devices.sdj),
  sdk: createTypeRecord(devices.sdk),
  sdl: createTypeRecord(devices.sdl),
  sdm: createTypeRecord(devices.sdm),
  sdn: createTypeRecord(devices.sdn),
  sdo: createTypeRecord(devices.sdo),
  sdp: createTypeRecord(devices.sdp),
  sdq: createTypeRecord(devices.sdq),
  sdr: createTypeRecord(devices.sdr),
  sds: createTypeRecord(devices.sds),
  sdt: createTypeRecord(devices.sdt),
  sdu: createTypeRecord(devices.sdu),
  sdv: createTypeRecord(devices.sdv),
  sdw: createTypeRecord(devices.sdw),
  sdx: createTypeRecord(devices.sdx),
  sdy: createTypeRecord(devices.sdy),
  sdz: createTypeRecord(devices.sdz),
  sdaa: createTypeRecord(devices.sdaa),
  sdab: createTypeRecord(devices.sdab),
  sdac: createTypeRecord(devices.sdac),
  sdad: createTypeRecord(devices.sdad),
  sdae: createTypeRecord(devices.sdae),
  sdaf: createTypeRecord(devices.sdaf),
  sdag: createTypeRecord(devices.sdag),
  sdah: createTypeRecord(devices.sdah),
  sdai: createTypeRecord(devices.sdai),
  sdaj: createTypeRecord(devices.sdaj),
  sdak: createTypeRecord(devices.sdak),
  sdal: createTypeRecord(devices.sdal),
  sdam: createTypeRecord(devices.sdam),
  sdan: createTypeRecord(devices.sdan),
  sdao: createTypeRecord(devices.sdao),
  sdap: createTypeRecord(devices.sdap),
  sdaq: createTypeRecord(devices.sdaq),
  sdar: createTypeRecord(devices.sdar),
  sdas: createTypeRecord(devices.sdas),
  sdat: createTypeRecord(devices.sdat),
  sdau: createTypeRecord(devices.sdau),
  sdav: createTypeRecord(devices.sdav),
  sdaw: createTypeRecord(devices.sdaw),
  sdax: createTypeRecord(devices.sdax),
  sday: createTypeRecord(devices.sday),
  sdaz: createTypeRecord(devices.sdaz),
  sdba: createTypeRecord(devices.sdba),
  sdbb: createTypeRecord(devices.sdbb),
  sdbc: createTypeRecord(devices.sdbc),
  sdbd: createTypeRecord(devices.sdbd),
  sdbe: createTypeRecord(devices.sdbe),
  sdbf: createTypeRecord(devices.sdbf),
  sdbg: createTypeRecord(devices.sdbg),
  sdbh: createTypeRecord(devices.sdbh),
  sdbi: createTypeRecord(devices.sdbi),
  sdbj: createTypeRecord(devices.sdbj),
  sdbk: createTypeRecord(devices.sdbk),
  sdbl: createTypeRecord(devices.sdbl),
});
