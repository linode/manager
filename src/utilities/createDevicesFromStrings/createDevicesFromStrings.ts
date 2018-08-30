import {
  always,
  compose,
  contains,
  ifElse,
  isNil,
  last,
  objOf,
  split,
} from 'ramda';

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

let getIdOrNullFor: (t: string) => (d?: string) => null | Linode.VolumeDevice | Linode.DiskDevice;
getIdOrNullFor = type => compose(
  ifElse(isNil, always(null), compose(
    ifElse(
      contains(type),
      compose<string, string[], string, number, Record<string, number>>(
        objOf(`${type}_id`), Number, last, split('-'),
      ),
      always(null),
    ),
  )),
);

const idForDisk = getIdOrNullFor('disk');
const idForVolume = getIdOrNullFor('volume');

let createDevicesFromStrings: (v: DevicesAsStrings) => Linode.Devices;
createDevicesFromStrings = devices => ({
  sda: idForDisk(devices.sda) || idForVolume(devices.sda),
  sdb: idForDisk(devices.sdb) || idForVolume(devices.sdb),
  sdc: idForDisk(devices.sdc) || idForVolume(devices.sdc),
  sdd: idForDisk(devices.sdd) || idForVolume(devices.sdd),
  sde: idForDisk(devices.sde) || idForVolume(devices.sde),
  sdf: idForDisk(devices.sdf) || idForVolume(devices.sdf),
  sdg: idForDisk(devices.sdg) || idForVolume(devices.sdg),
  sdh: idForDisk(devices.sdh) || idForVolume(devices.sdh),
});

export default createDevicesFromStrings;
