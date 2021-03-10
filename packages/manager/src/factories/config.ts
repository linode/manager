import * as Factory from 'factory.ts';
import { Config } from '@linode/api-v4/lib/linodes/types';

export const configFactory = Factory.Sync.makeFactory<Config>({
  id: Factory.each((id) => id),
  label: Factory.each((id) => `disk-${id}`),
  created: '2020-01-01',
  updated: '2020-01-01',
  comments: '',
  devices: {
    sda: null,
    sdb: null,
    sdc: null,
    sdd: null,
    sde: null,
    sdf: null,
    sdg: null,
    sdh: null,
  },
  helpers: {
    distro: true,
    network: true,
    modules_dep: true,
    devtmpfs_automount: true,
    updatedb_disabled: true,
  },
  initrd: null,
  kernel: 'linode/grub2',
  memory_limit: 0,
  root_device: 'sda',
  run_level: 'default',
  virt_mode: 'paravirt',
  interfaces: []
});
