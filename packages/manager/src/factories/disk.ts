import * as Factory from 'factory.ts';
import { Disk } from '@linode/api-v4/lib/linodes/types';

export const linodeDiskFactory = Factory.Sync.makeFactory<Disk>({
  id: Factory.each(id => id),
  label: Factory.each(id => `disk-${id}`),
  status: 'running',
  created: '2018-01-01',
  updated: '2019-01-01',
  filesystem: 'raw',
  size: 1000,
});
