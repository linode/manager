import { LinodeType } from '@linode/api-v4/lib/linodes/types';
import * as Factory from 'factory.ts';

export const typeFactory = Factory.Sync.makeFactory<LinodeType>({
  addons: {
    backups: {
      price: {
        hourly: 10,
        monthly: 10,
      },
      region_prices: [
        {
          hourly: 0.0048,
          id: 'id-cgk',
          monthly: 3.57,
        },
        {
          hourly: 0.0056,
          id: 'br-gru',
          monthly: 4.17,
        },
      ],
    },
  },
  class: 'standard',
  disk: 1048576,
  gpus: 0,
  id: 'g6-standard-1',
  label: 'Linode Metal Alpha 1',
  memory: 16384,
  network_out: 10000,
  price: {
    hourly: 0,
    monthly: 0,
  },
  region_prices: [
    {
      hourly: 0.015,
      id: 'us-east',
      monthly: 10,
    },
    {
      hourly: 0.021,
      id: 'br-gru',
      monthly: 14,
    },
    {
      hourly: 0.018,
      id: 'id-cgk',
      monthly: 12,
    },
  ],
  successor: null,
  transfer: 1000,
  vcpus: 8,
});
