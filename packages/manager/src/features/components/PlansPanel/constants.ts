import type { ExtendedType } from 'src/utilities/extendType';

export const LIMITED_AVAILABILITY_COPY =
  'This plan has limited deployment availability.';
export const SMALLER_PLAN_DISABLED_COPY =
  'Resizing to smaller plans is not supported.';
export const PLAN_IS_SMALLER_THAN_USAGE_COPY =
  'The usage storage in this plan is smaller than your current usage.';
export const PLAN_NOT_AVAILABLE_IN_REGION_COPY =
  "This plan isn't available for the selected region.";
export const PLAN_IS_CURRENTLY_UNAVAILABLE_COPY =
  'This plan is currently unavailable.';
export const PLAN_IS_TOO_SMALL_FOR_APL_COPY =
  'This plan is too small for Akamai App Platform.';
export const APL_NOTICE_COPY =
  'Shared CPU instances are currently not available for Akamai App Platform.';

export const LIMITED_AVAILABILITY_LINK =
  'https://www.linode.com/global-infrastructure/availability/';
export const DEDICATED_COMPUTE_INSTANCES_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/dedicated-cpu-compute-instances';
export const SHARED_COMPUTE_INSTANCES_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/shared-cpu-compute-instances';
export const HIGH_MEMORY_COMPUTE_INSTANCES_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/high-memory-compute-instances';
export const PREMIUM_COMPUTE_INSTANCES_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/premium-compute-instances';
export const GPU_COMPUTE_INSTANCES_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/gpu-compute-instances';
export const TRANSFER_COSTS_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/network-transfer-usage-and-costs';
export const ACCELERATED_COMPUTE_INSTANCES_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/accelerated-compute-instances';

export const MTC_TT = {
  availability_regions: ['us-iad', 'no-east'], // Currently available in iad/oslo regions.
  available_types: ['g8-premium-64-ht', 'g8-premium-128-ht'],
} as const;

export const DEDICATED_512_GB_PLAN: ExtendedType = {
  accelerated_devices: 0,
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

export const PREMIUM_512_GB_PLAN: ExtendedType = {
  accelerated_devices: 0,
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
