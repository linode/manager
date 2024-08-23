import { Config } from '@linode/api-v4/lib/linodes/types';
import Factory from 'src/factories/factoryProxy';

export const configFactory = Factory.Sync.makeFactory<Config>({
  comments: '',
  created: '2020-01-01',
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
    devtmpfs_automount: true,
    distro: true,
    modules_dep: true,
    network: true,
    updatedb_disabled: true,
  },
  id: Factory.each((id) => id),
  initrd: null,
  interfaces: [],
  kernel: 'linode/grub2',
  label: Factory.each((id) => `disk-${id}`),
  memory_limit: 0,
  root_device: 'sda',
  run_level: 'default',
  updated: '2020-01-01',
  virt_mode: 'paravirt',
});
