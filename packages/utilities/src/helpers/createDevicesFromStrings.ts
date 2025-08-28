import type { Devices } from '@linode/api-v4/lib/linodes';

type DiskRecord = Record<'disk_id', number>;

type VolumeRecord = Record<'volume_id', number>;

export interface DevicesAsStrings {
  sda?: string;
  sdaa?: string;
  sdab?: string;
  sdac?: string;
  sdad?: string;
  sdae?: string;
  sdaf?: string;
  sdag?: string;
  sdah?: string;
  sdai?: string;
  sdaj?: string;
  sdak?: string;
  sdal?: string;
  sdam?: string;
  sdan?: string;
  sdao?: string;
  sdap?: string;
  sdaq?: string;
  sdar?: string;
  sdas?: string;
  sdat?: string;
  sdau?: string;
  sdav?: string;
  sdaw?: string;
  sdax?: string;
  sday?: string;
  sdaz?: string;
  sdb?: string;
  sdba?: string;
  sdbb?: string;
  sdbc?: string;
  sdbd?: string;
  sdbe?: string;
  sdbf?: string;
  sdbg?: string;
  sdbh?: string;
  sdbi?: string;
  sdbj?: string;
  sdbk?: string;
  sdbl?: string;
  sdc?: string;
  sdd?: string;
  sde?: string;
  sdf?: string;
  sdg?: string;
  sdh?: string;
  sdi?: string;
  sdj?: string;
  sdk?: string;
  sdl?: string;
  sdm?: string;
  sdn?: string;
  sdo?: string;
  sdp?: string;
  sdq?: string;
  sdr?: string;
  sds?: string;
  sdt?: string;
  sdu?: string;
  sdv?: string;
  sdw?: string;
  sdx?: string;
  sdy?: string;
  sdz?: string;
}

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
