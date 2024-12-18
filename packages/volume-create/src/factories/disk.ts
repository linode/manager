import { Disk } from '@linode/api-v4/lib/linodes/types';
import Factory from 'src/factories/factoryProxy';

export const linodeDiskFactory = Factory.Sync.makeFactory<Disk>({
  created: '2018-01-01',
  disk_encryption: 'enabled',
  filesystem: 'raw',
  id: Factory.each((id) => id),
  label: Factory.each((id) => `disk-${id}`),
  size: 1000,
  status: 'ready',
  updated: '2019-01-01',
});
