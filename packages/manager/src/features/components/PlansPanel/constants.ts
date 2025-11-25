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

export const PLAN_PANEL_PAGE_SIZE_OPTIONS = [
  { label: 'Show 15', value: 15 },
  { label: 'Show 25', value: 25 },
  { label: 'Show 50', value: 50 },
];

// List of plan types that belong to the MTC plan group.
export const MTC_AVAILABLE_PLAN_TYPES = ['g8-premium-128-ht'];

// ============================================================================
// Plan Filter Constants
// ============================================================================

export const PLAN_FILTER_NO_RESULTS_MESSAGE = 'No plans found.';

// G8 Dedicated CPU Plans - Compute Optimized (1:2 RAM:CPU ratio)
export const G8_DEDICATED_COMPUTE_OPTIMIZED_SLUGS = [
  'g8-dedicated-4-2', // 4 GB RAM, 2 CPUs
  'g8-dedicated-8-4', // 8 GB RAM, 4 CPUs
  'g8-dedicated-16-8', // 16 GB RAM, 8 CPUs
  'g8-dedicated-32-16', // 32 GB RAM, 16 CPUs
  'g8-dedicated-64-32', // 64 GB RAM, 32 CPUs
  'g8-dedicated-96-48', // 96 GB RAM, 48 CPUs
  'g8-dedicated-128-64', // 128 GB RAM, 64 CPUs
  'g8-dedicated-256-128', // 256 GB RAM, 128 CPUs
  'g8-dedicated-512-256', // 512 GB RAM, 256 CPUs
] as const;

// G8 Dedicated CPU Plans - General Purpose (1:4 RAM:CPU ratio)
export const G8_DEDICATED_GENERAL_PURPOSE_SLUGS = [
  'g8-dedicated-8-2', // 8 GB RAM, 2 CPUs
  'g8-dedicated-16-4', // 16 GB RAM, 4 CPUs
  'g8-dedicated-32-8', // 32 GB RAM, 8 CPUs
  'g8-dedicated-64-16', // 64 GB RAM, 16 CPUs
  'g8-dedicated-96-24', // 96 GB RAM, 24 CPUs
  'g8-dedicated-128-32', // 128 GB RAM, 32 CPUs
  'g8-dedicated-256-64', // 256 GB RAM, 64 CPUs
  'g8-dedicated-512-128', // 512 GB RAM, 128 CPUs
] as const;

// Combined G8 plans (All)
export const G8_DEDICATED_ALL_SLUGS = [
  ...G8_DEDICATED_COMPUTE_OPTIMIZED_SLUGS,
  ...G8_DEDICATED_GENERAL_PURPOSE_SLUGS,
] as const;

export const PLAN_FILTER_ALL = 'all';
// Filter option values
export const PLAN_FILTER_GENERATION_G8 = 'g8';
export const PLAN_FILTER_GENERATION_G7 = 'g7';
export const PLAN_FILTER_GENERATION_G6 = 'g6';

export const PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED = 'compute-optimized';
export const PLAN_FILTER_TYPE_GENERAL_PURPOSE = 'general-purpose';

export const PLAN_FILTER_GPU_RTX_PRO_6000 = 'gpu-rtxpro6000';
export const PLAN_FILTER_GPU_RTX_6000 = 'gpu-rtx6000';
export const PLAN_FILTER_GPU_RTX_4000_ADA = 'gpu-rtx4000';

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
