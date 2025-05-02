import { Factory } from '@linode/utilities';

import type { LinodeType, PriceType } from '@linode/api-v4';
import type {
  PlanSelectionAvailabilityTypes,
  PlanWithAvailability,
} from 'src/features/components/PlansPanel/types';
import type { ExtendedType } from 'src/utilities/extendType';

export const typeFactory = Factory.Sync.makeFactory<LinodeType>({
  accelerated_devices: 0,
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
      monthly: 14.4,
    },
    {
      hourly: 0.018,
      id: 'id-cgk',
      monthly: 12.2,
    },
  ],
  successor: null,
  transfer: 1000,
  vcpus: 8,
});

export const planSelectionTypeFactory =
  Factory.Sync.makeFactory<PlanWithAvailability>({
    class: typeFactory.build().class,
    disk: typeFactory.build().disk,
    formattedLabel: '',
    heading: 'Dedicated 20 GB',
    id: typeFactory.build().id,
    label: typeFactory.build().label,
    memory: typeFactory.build().memory,
    network_out: typeFactory.build().network_out,
    planBelongsToDisabledClass: false,
    planHasLimitedAvailability: false,
    planIsDisabled512Gb: false,
    planIsTooSmall: false,
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
  });

export const extendedTypeFactory = Factory.Sync.makeFactory<
  ExtendedType & PlanSelectionAvailabilityTypes
>({
  accelerated_devices: 0,
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
  class: typeFactory.build().class,
  disk: typeFactory.build().disk,
  formattedLabel: '',
  gpus: typeFactory.build().gpus,
  heading: 'Dedicated 20 GB',
  id: typeFactory.build().id,
  isDeprecated: false,
  label: typeFactory.build().label,
  memory: typeFactory.build().memory,
  network_out: typeFactory.build().network_out,
  planBelongsToDisabledClass: false,
  planHasLimitedAvailability: false,
  planIsDisabled512Gb: false,
  planIsTooSmall: false,
  price: typeFactory.build().price,
  region_prices: typeFactory.build().region_prices,
  subHeadings: ['$10/mo ($0.015/hr)', '8 CPU, 1024 GB Storage, 16 GB RAM'],
  successor: typeFactory.build().successor,
  transfer: typeFactory.build().transfer,
  vcpus: typeFactory.build().vcpus,
});

export const nodeBalancerTypeFactory = Factory.Sync.makeFactory<PriceType>({
  id: 'nodebalancer',
  label: 'NodeBalancer',
  price: {
    hourly: 0.015,
    monthly: 10.0,
  },
  region_prices: [
    {
      hourly: 0.018,
      id: 'id-cgk',
      monthly: 12.0,
    },
    {
      hourly: 0.021,
      id: 'br-gru',
      monthly: 14.0,
    },
  ],
  transfer: 0,
});

export const volumeTypeFactory = Factory.Sync.makeFactory<PriceType>({
  id: 'volume',
  label: 'Volume',
  price: {
    hourly: 0.00015,
    monthly: 0.1,
  },
  region_prices: [
    {
      hourly: 0.00018,
      id: 'id-cgk',
      monthly: 0.12,
    },
    {
      hourly: 0.00021,
      id: 'br-gru',
      monthly: 0.14,
    },
  ],
  transfer: 0,
});

export const lkeStandardAvailabilityTypeFactory =
  Factory.Sync.makeFactory<PriceType>({
    id: 'lke-sa',
    label: 'LKE Standard Availability',
    price: {
      hourly: 0.0,
      monthly: 0.0,
    },
    region_prices: [],
    transfer: 0,
  });

export const lkeHighAvailabilityTypeFactory =
  Factory.Sync.makeFactory<PriceType>({
    id: 'lke-ha',
    label: 'LKE High Availability',
    price: {
      hourly: 0.09,
      monthly: 60.0,
    },
    region_prices: [
      {
        hourly: 0.108,
        id: 'id-cgk',
        monthly: 72.0,
      },
      {
        hourly: 0.126,
        id: 'br-gru',
        monthly: 84.0,
      },
    ],
    transfer: 0,
  });

export const lkeEnterpriseTypeFactory = Factory.Sync.makeFactory<PriceType>({
  id: 'lke-e',
  label: 'LKE Enterprise',
  price: {
    hourly: 0.45,
    monthly: 300,
  },
  region_prices: [],
  transfer: 0,
});

export const objectStorageTypeFactory = Factory.Sync.makeFactory<PriceType>({
  id: 'objectstorage',
  label: 'Object Storage',
  price: {
    hourly: 0.0075,
    monthly: 5.0,
  },
  region_prices: [
    {
      hourly: 0.0075,
      id: 'id-cgk',
      monthly: 5.0,
    },
    {
      hourly: 0.0075,
      id: 'br-gru',
      monthly: 5.0,
    },
  ],
  transfer: 1000,
});

export const objectStorageOverageTypeFactory =
  Factory.Sync.makeFactory<PriceType>({
    id: 'objectstorage-overage',
    label: 'Object Storage Overage',
    price: {
      hourly: 0.02,
      monthly: null,
    },
    region_prices: [
      {
        hourly: 0.024,
        id: 'id-cgk',
        monthly: null,
      },
      {
        hourly: 0.028,
        id: 'br-gru',
        monthly: null,
      },
    ],
    transfer: 0,
  });

export const distributedNetworkTransferPriceTypeFactory =
  Factory.Sync.makeFactory<PriceType>({
    id: 'distributed_network_transfer',
    label: 'Distributed Network Transfer',
    price: {
      hourly: 0.01,
      monthly: null,
    },
    region_prices: [],
    transfer: 0,
  });

export const networkTransferPriceTypeFactory =
  Factory.Sync.makeFactory<PriceType>({
    id: 'network_transfer',
    label: 'Network Transfer',
    price: {
      hourly: 0.005,
      monthly: null,
    },
    region_prices: [
      {
        hourly: 0.015,
        id: 'id-cgk',
        monthly: null,
      },
      {
        hourly: 0.007,
        id: 'br-gru',
        monthly: null,
      },
    ],
    transfer: 0,
  });
