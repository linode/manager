import type { Devices } from '@linode/api-v4/lib/linodes';

type DiskRecord = Record<'disk_id', number>;

type VolumeRecord = Record<'volume_id', number>;

type StringTypeMap<T> = {
  [key in keyof T]?: string;
};

export type DevicesAsStrings = StringTypeMap<Devices>;

/**
 * The `value` should be formatted as volume-123, disk-123, etc.,
 */
const createTypeRecord = (value?: string): DiskRecord | null | VolumeRecord => {
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

const createTypeRecordAllowUndefined = (
  value?: string,
): DiskRecord | null | undefined | VolumeRecord => {
  if (value === undefined) {
    return undefined;
  }

  return createTypeRecord(value);
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
  sdi: createTypeRecordAllowUndefined(devices.sdi),
  sdj: createTypeRecordAllowUndefined(devices.sdj),
  sdk: createTypeRecordAllowUndefined(devices.sdk),
  sdl: createTypeRecordAllowUndefined(devices.sdl),
  sdm: createTypeRecordAllowUndefined(devices.sdm),
  sdn: createTypeRecordAllowUndefined(devices.sdn),
  sdo: createTypeRecordAllowUndefined(devices.sdo),
  sdp: createTypeRecordAllowUndefined(devices.sdp),
  sdq: createTypeRecordAllowUndefined(devices.sdq),
  sdr: createTypeRecordAllowUndefined(devices.sdr),
  sds: createTypeRecordAllowUndefined(devices.sds),
  sdt: createTypeRecordAllowUndefined(devices.sdt),
  sdu: createTypeRecordAllowUndefined(devices.sdu),
  sdv: createTypeRecordAllowUndefined(devices.sdv),
  sdw: createTypeRecordAllowUndefined(devices.sdw),
  sdx: createTypeRecordAllowUndefined(devices.sdx),
  sdy: createTypeRecordAllowUndefined(devices.sdy),
  sdz: createTypeRecordAllowUndefined(devices.sdz),
  sdaa: createTypeRecordAllowUndefined(devices.sdaa),
  sdab: createTypeRecordAllowUndefined(devices.sdab),
  sdac: createTypeRecordAllowUndefined(devices.sdac),
  sdad: createTypeRecordAllowUndefined(devices.sdad),
  sdae: createTypeRecordAllowUndefined(devices.sdae),
  sdaf: createTypeRecordAllowUndefined(devices.sdaf),
  sdag: createTypeRecordAllowUndefined(devices.sdag),
  sdah: createTypeRecordAllowUndefined(devices.sdah),
  sdai: createTypeRecordAllowUndefined(devices.sdai),
  sdaj: createTypeRecordAllowUndefined(devices.sdaj),
  sdak: createTypeRecordAllowUndefined(devices.sdak),
  sdal: createTypeRecordAllowUndefined(devices.sdal),
  sdam: createTypeRecordAllowUndefined(devices.sdam),
  sdan: createTypeRecordAllowUndefined(devices.sdan),
  sdao: createTypeRecordAllowUndefined(devices.sdao),
  sdap: createTypeRecordAllowUndefined(devices.sdap),
  sdaq: createTypeRecordAllowUndefined(devices.sdaq),
  sdar: createTypeRecordAllowUndefined(devices.sdar),
  sdas: createTypeRecordAllowUndefined(devices.sdas),
  sdat: createTypeRecordAllowUndefined(devices.sdat),
  sdau: createTypeRecordAllowUndefined(devices.sdau),
  sdav: createTypeRecordAllowUndefined(devices.sdav),
  sdaw: createTypeRecordAllowUndefined(devices.sdaw),
  sdax: createTypeRecordAllowUndefined(devices.sdax),
  sday: createTypeRecordAllowUndefined(devices.sday),
  sdaz: createTypeRecordAllowUndefined(devices.sdaz),
  sdba: createTypeRecordAllowUndefined(devices.sdba),
  sdbb: createTypeRecordAllowUndefined(devices.sdbb),
  sdbc: createTypeRecordAllowUndefined(devices.sdbc),
  sdbd: createTypeRecordAllowUndefined(devices.sdbd),
  sdbe: createTypeRecordAllowUndefined(devices.sdbe),
  sdbf: createTypeRecordAllowUndefined(devices.sdbf),
  sdbg: createTypeRecordAllowUndefined(devices.sdbg),
  sdbh: createTypeRecordAllowUndefined(devices.sdbh),
  sdbi: createTypeRecordAllowUndefined(devices.sdbi),
  sdbj: createTypeRecordAllowUndefined(devices.sdbj),
  sdbk: createTypeRecordAllowUndefined(devices.sdbk),
  sdbl: createTypeRecordAllowUndefined(devices.sdbl),
});
