import * as Factory from 'factory.ts';
import { Config } from 'linode-js-sdk/lib/linodes/types';

const generateRandomId = () => Math.floor(Math.random() * 10000);

export const linodeConfigFactory = Factory.Sync.makeFactory<Config>({
  created: '2018-06-26T16:04:28',
  memory_limit: 0,
  updated: '2018-06-26T16:04:28',
  comments: '',
  virt_mode: 'paravirt',
  id: Factory.each(i => i),
  run_level: 'default',
  helpers: {
    distro: true,
    network: true,
    modules_dep: true,
    devtmpfs_automount: true,
    updatedb_disabled: true
  },
  root_device: '/dev/sda',
  label: 'My Arch Linux Disk Profile',
  initrd: null,
  devices: {
    sdc: {
      volume_id: 8702,
      disk_id: null
    },
    sda: {
      volume_id: null,
      disk_id: generateRandomId()
    },
    sdd: null,
    sdf: null,
    sdb: {
      volume_id: null,
      disk_id: generateRandomId()
    },
    sdh: null,
    sdg: null,
    sde: null
  },
  kernel: 'linode/grub2'
});
