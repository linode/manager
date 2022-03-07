import { LinodeType } from '@linode/api-v4/lib/linodes/types';
import * as Factory from 'factory.ts';

export const typeFactory = Factory.Sync.makeFactory<LinodeType>({
  id: 'g6-standard-1',
  label: 'Linode Metal Alpha 1',
  price: {
    hourly: 0,
    monthly: 0,
  },
  addons: {
    backups: {
      price: {
        hourly: 10,
        monthly: 10,
      },
    },
  },
  memory: 16384,
  disk: 1048576,
  transfer: 1000,
  vcpus: 8,
  gpus: 0,
  network_out: 10000,
  class: 'standard',
  successor: null,
});
