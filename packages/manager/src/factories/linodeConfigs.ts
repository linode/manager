import {
  Factory,
  linodeConfigInterfaceFactory,
  linodeConfigInterfaceFactoryWithVPC,
} from '@linode/utilities';

import type { Config } from '@linode/api-v4';

const generateRandomId = () => Math.floor(Math.random() * 10000);

const publicInterface = linodeConfigInterfaceFactory.build({
  ipam_address: null,
  purpose: 'public',
});
const [vlanInterface1, vlanInterface2] =
  linodeConfigInterfaceFactory.buildList(2);

const vpcInterface = linodeConfigInterfaceFactoryWithVPC.build();

export const linodeConfigFactory = Factory.Sync.makeFactory<Config>({
  comments: '',
  created: '2018-06-26T16:04:28',
  devices: {
    sda: {
      disk_id: generateRandomId(),
      volume_id: null,
    },
    sdb: {
      disk_id: generateRandomId(),
      volume_id: null,
    },
    sdc: {
      disk_id: null,
      volume_id: 8702,
    },
    sdd: null,
    sde: null,
    sdf: null,
    sdg: null,
    sdh: null,
  },
  helpers: {
    devtmpfs_automount: true,
    distro: true,
    modules_dep: true,
    network: true,
    updatedb_disabled: true,
  },
  id: Factory.each((i) => i),
  initrd: null,
  interfaces: [
    // The order of this array is significant. Index 0 (eth0) should be public.
    publicInterface,
    vlanInterface1,
    vlanInterface2,
    vpcInterface,
  ],
  kernel: 'linode/grub2',
  label: 'My Arch Linux Disk Profile',
  memory_limit: 0,
  root_device: '/dev/sda',
  run_level: 'default',
  updated: '2018-06-26T16:04:28',
  virt_mode: 'paravirt',
});
