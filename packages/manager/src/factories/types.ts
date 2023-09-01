import { LinodeType } from '@linode/api-v4/lib/linodes/types';
import * as Factory from 'factory.ts';

import type { PlanSelectionType } from 'src/features/components/PlansPanel/types';

export const typeFactory = Factory.Sync.makeFactory<LinodeType>({
  addons: {
    backups: {
      price: {
        hourly: 0.004,
        monthly: 2.5,
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
    hourly: 0.015,
    monthly: 10,
  },
  region_prices: [
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

export const planSelectionTypeFactory = Factory.Sync.makeFactory<PlanSelectionType>(
  {
    class: typeFactory.build().class,
    disk: typeFactory.build().disk,
    formattedLabel: '',
    heading: 'Dedicated 20 GB',
    id: typeFactory.build().id,
    label: typeFactory.build().label,
    memory: typeFactory.build().memory,
    network_out: typeFactory.build().network_out,
    price: typeFactory.build().price,
    region_prices: typeFactory.build().region_prices,
    subHeadings: [
      '$10/mo ($0.015/hr)',
      '1 CPU, 50 GB Storage, 2 GB RAM',
      '2 TB Transfer',
      '40 Gbps In / 2 Gbps Out',
    ],
    transfer: typeFactory.build().transfer,
    vcpus: typeFactory.build().vcpus,
  }
);
