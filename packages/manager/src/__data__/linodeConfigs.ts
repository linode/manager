import type { Config } from '@linode/api-v4/lib/linodes';

export const linodeConfigs: Config[] = [
  {
    comments: '',
    created: '2018-06-26T16:04:28',
    devices: {
      sda: {
        disk_id: 18795181,
        volume_id: null,
      },
      sdb: {
        disk_id: 18795182,
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
    id: 9859511,
    initrd: null,
    interfaces: [],
    kernel: 'linode/grub2',
    label: 'My Arch Linux Disk Profile',
    memory_limit: 0,
    root_device: '/dev/sda',
    run_level: 'default',
    updated: '2018-06-26T16:04:28',
    virt_mode: 'paravirt',
  },
];
export const linodeConfig2: Config = {
  comments: '',
  created: '2018-06-26T16:05:28',
  devices: {
    sda: {
      disk_id: 18795181,
      volume_id: null,
    },
    sdb: {
      disk_id: 18795182,
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
  id: 1234,
  initrd: null,
  interfaces: [],
  kernel: 'linode/grub2',
  label: 'My Arch Linux Disk Profile',
  memory_limit: 0,
  root_device: '/dev/sda',
  run_level: 'default',
  updated: '2018-06-26T16:05:28',
  virt_mode: 'paravirt',
};
