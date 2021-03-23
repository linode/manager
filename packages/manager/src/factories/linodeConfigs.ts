import * as Factory from 'factory.ts';
import { Config } from '@linode/api-v4/lib/linodes/types';
import { LinodeConfigInterfaceFactory } from 'src/factories/linodeConfigInterfaceFactory';

const generateRandomId = () => Math.floor(Math.random() * 10000);

const publicInterface = LinodeConfigInterfaceFactory.build({
  purpose: 'public',
  ipam_address: null,
});
const [vlanInterface1, vlanInterface2] = LinodeConfigInterfaceFactory.buildList(
  2
);

export const linodeConfigFactory = Factory.Sync.makeFactory<Config>({
  created: '2018-06-26T16:04:28',
  memory_limit: 0,
  updated: '2018-06-26T16:04:28',
  comments: '',
  virt_mode: 'paravirt',
  id: Factory.each((i) => i),
  run_level: 'default',
  helpers: {
    distro: true,
    network: true,
    modules_dep: true,
    devtmpfs_automount: true,
    updatedb_disabled: true,
  },
  root_device: '/dev/sda',
  label: 'My Arch Linux Disk Profile',
  initrd: null,
  devices: {
    sdc: {
      volume_id: 8702,
      disk_id: null,
    },
    sda: {
      volume_id: null,
      disk_id: generateRandomId(),
    },
    sdd: null,
    sdf: null,
    sdb: {
      volume_id: null,
      disk_id: generateRandomId(),
    },
    sdh: null,
    sdg: null,
    sde: null,
  },
  kernel: 'linode/grub2',
  interfaces: [
    // The order of this array is significant. Index 0 (eth0) should be public.
    publicInterface,
    vlanInterface1,
    vlanInterface2,
  ],
});
