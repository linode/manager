import type { PlanSelectionType } from './types';
import type { ExtendedType } from 'src/utilities/extendType';

export const LIMITED_AVAILABILITY_TEXT = 'This plan has limited availability.';
export const LIMITED_AVAILABILITY_LINK =
  'https://www.linode.com/global-infrastructure/availability/';
export const LIMITED_AVAILABILITY_DISMISSIBLEBANNER_KEY =
  'plan-limited-availability-notice';

export const DEDICATED_COMPUTE_INSTANCES_LINK =
  'https://www.linode.com/docs/products/compute/compute-instances/plans/dedicated-cpu/';
export const PREMIUM_COMPUTE_INSTANCES_LINK =
  'https://www.linode.com/docs/products/compute/compute-instances/plans/premium/';
export const GPU_COMPUTE_INSTANCES_LINK =
  'https://www.linode.com/docs/products/compute/compute-instances/plans/gpu/';

export const DEDICATED_512_GB_PLAN: ExtendedType = {
  addons: {
    backups: {
      price: {
        hourly: 0.36,
        monthly: 240,
      },
      region_prices: [
        {
          hourly: 0.432,
          id: 'id-cgk',
          monthly: 288,
        },
        {
          hourly: 0.504,
          id: 'br-gru',
          monthly: 336,
        },
      ],
    },
  },
  class: 'dedicated',
  disk: 7372800,
  formattedLabel: 'Dedicated 512 GB',
  gpus: 0,
  heading: 'Dedicated 512 GB',
  id: 'g6-dedicated-64',
  isDeprecated: false,
  label: 'Dedicated 512GB',
  memory: 524288,
  network_out: 12000,
  price: {
    hourly: 6.912,
    monthly: 4608,
  },
  region_prices: [
    {
      hourly: 8.294,
      id: 'id-cgk',
      monthly: 5529.6,
    },
    {
      hourly: 9.677,
      id: 'br-gru',
      monthly: 6451.2,
    },
  ],
  subHeadings: [
    '$4608/mo ($6.912/hr)',
    '64 CPU, 7200 GB Storage, 512 GB RAM',
    '12 TB Transfer',
    '40 Gbps In / 12 Gbps Out',
  ],
  successor: null,
  transfer: 12000,
  vcpus: 64,
};

export const DBAAS_DEDICATED_512_GB_PLAN: PlanSelectionType = {
  class: 'dedicated',
  disk: 7372800,
  // engines: {
  //   mysql: [
  //     {
  //       price: {
  //         hourly: 12.48,
  //         monthly: 8320,
  //       },
  //       quantity: 1,
  //     },
  //     {
  //       price: {
  //         hourly: 24.96,
  //         monthly: 16640,
  //       },
  //       quantity: 2,
  //     },
  //     {
  //       price: {
  //         hourly: 37.44,
  //         monthly: 24960,
  //       },
  //       quantity: 3,
  //     },
  //   ],
  //   postgresql: [
  //     {
  //       price: {
  //         hourly: 12.48,
  //         monthly: 8320,
  //       },
  //       quantity: 1,
  //     },
  //     {
  //       price: {
  //         hourly: 24.96,
  //         monthly: 16640,
  //       },
  //       quantity: 2,
  //     },
  //     {
  //       price: {
  //         hourly: 37.44,
  //         monthly: 24960,
  //       },
  //       quantity: 3,
  //     },
  //   ],
  // },
  formattedLabel: 'Dedicated 512 GB',
  heading: 'Dedicated 512 GB',
  id: 'g6-dedicated-64',
  label: 'DBaaS - Dedicated 512GB',
  memory: 524288,
  price: {
    hourly: 12.48,
    monthly: 8320,
  },
  subHeadings: ['$8320/mo ($12.48/hr)', '64 CPU, 7200 GB Storage, 512 GB RAM'],
  vcpus: 64,
};

export const PREMIUM_512_GB_PLAN: ExtendedType = {
  addons: {
    backups: {
      price: {
        hourly: 0.36,
        monthly: 240,
      },
      region_prices: [
        {
          hourly: 0.432,
          id: 'id-cgk',
          monthly: 288,
        },
        {
          hourly: 0.504,
          id: 'br-gru',
          monthly: 336,
        },
      ],
    },
  },
  class: 'premium',
  disk: 7372800,
  formattedLabel: 'Premium 512 GB',
  gpus: 0,
  heading: 'Premium 512 GB',
  id: 'g7-premium-64',
  isDeprecated: false,
  label: 'Premium 512GB',
  memory: 524288,
  network_out: 12000,
  price: {
    hourly: 8.295,
    monthly: 5530,
  },
  region_prices: [
    {
      hourly: 9.953,
      id: 'id-cgk',
      monthly: 6635.52,
    },
    {
      hourly: 11.612,
      id: 'br-gru',
      monthly: 7741.44,
    },
  ],
  subHeadings: [
    '$5530/mo ($8.295/hr)',
    '64 CPU, 7200 GB Storage, 512 GB RAM',
    '12 TB Transfer',
    '40 Gbps In / 12 Gbps Out',
  ],
  successor: null,
  transfer: 12000,
  vcpus: 64,
};
