import { PlanSelectionType } from './SelectPlanPanel';

import { FilteredPlanSelectionTypes, filterPlanSelectionTypes } from './utils';

export const types: PlanSelectionType[] = [
  {
    id: 'g6-nanode-1',
    label: 'Nanode 1GB',
    price: {
      hourly: 0.0075,
      monthly: 5,
    },
    memory: 1024,
    disk: 25600,
    transfer: 1000,
    vcpus: 1,
    network_out: 1000,
    class: 'nanode',
    formattedLabel: 'Nanode 1 GB',
    heading: 'Nanode 1 GB',
    subHeadings: [
      '$5/mo ($0.0075/hr)',
      '1 CPU, 25 GB Storage, 1 GB RAM',
      '1 TB Transfer',
      '40 Gbps In / 1 Gbps Out',
    ],
  },
  {
    id: 'g6-standard-1',
    label: 'Linode 2GB',
    price: {
      hourly: 0.015,
      monthly: 10,
    },
    memory: 2048,
    disk: 51200,
    transfer: 2000,
    vcpus: 1,

    network_out: 2000,
    class: 'standard',

    formattedLabel: 'Linode 2 GB',
    heading: 'Linode 2 GB',
    subHeadings: [
      '$10/mo ($0.015/hr)',
      '1 CPU, 50 GB Storage, 2 GB RAM',
      '2 TB Transfer',
      '40 Gbps In / 2 Gbps Out',
    ],
  },
  {
    id: 'g6-standard-2',
    label: 'Linode 4GB',
    price: {
      hourly: 0.03,
      monthly: 20,
    },

    memory: 4096,
    disk: 81920,
    transfer: 4000,
    vcpus: 2,

    network_out: 4000,
    class: 'standard',

    formattedLabel: 'Linode 4 GB',
    heading: 'Linode 4 GB',
    subHeadings: [
      '$20/mo ($0.03/hr)',
      '2 CPU, 80 GB Storage, 4 GB RAM',
      '4 TB Transfer',
      '40 Gbps In / 4 Gbps Out',
    ],
  },
  {
    id: 'g6-highmem-2',
    label: 'Linode 4GB',
    price: {
      hourly: 0.03,
      monthly: 20,
    },

    memory: 4096,
    disk: 81920,
    transfer: 4000,
    vcpus: 2,

    network_out: 4000,
    class: 'highmem',

    formattedLabel: 'Linode 4 GB',
    heading: 'Linode 4 GB',
    subHeadings: [
      '$20/mo ($0.03/hr)',
      '2 CPU, 80 GB Storage, 4 GB RAM',
      '4 TB Transfer',
      '40 Gbps In / 4 Gbps Out',
    ],
  },
  {
    id: 'g6-prodedicated-2',
    label: 'Linode 4GB',
    price: {
      hourly: 0.03,
      monthly: 20,
    },

    memory: 4096,
    disk: 81920,
    transfer: 4000,
    vcpus: 2,

    network_out: 4000,
    class: 'prodedicated',

    formattedLabel: 'Linode 4 GB',
    heading: 'Linode 4 GB',
    subHeadings: [
      '$20/mo ($0.03/hr)',
      '2 CPU, 80 GB Storage, 4 GB RAM',
      '4 TB Transfer',
      '40 Gbps In / 4 Gbps Out',
    ],
  },
  {
    id: 'g6-dedicated-2',
    label: 'Linode 4GB',
    price: {
      hourly: 0.03,
      monthly: 20,
    },

    memory: 4096,
    disk: 81920,
    transfer: 4000,
    vcpus: 2,

    network_out: 4000,
    class: 'dedicated',

    formattedLabel: 'Linode 4 GB',
    heading: 'Linode 4 GB',
    subHeadings: [
      '$20/mo ($0.03/hr)',
      '2 CPU, 80 GB Storage, 4 GB RAM',
      '4 TB Transfer',
      '40 Gbps In / 4 Gbps Out',
    ],
  },
  {
    id: 'g6-gpu-2',
    label: 'Linode 4GB',
    price: {
      hourly: 0.03,
      monthly: 20,
    },

    memory: 4096,
    disk: 81920,
    transfer: 4000,
    vcpus: 2,

    network_out: 4000,
    class: 'gpu',

    formattedLabel: 'Linode 4 GB',
    heading: 'Linode 4 GB',
    subHeadings: [
      '$20/mo ($0.03/hr)',
      '2 CPU, 80 GB Storage, 4 GB RAM',
      '4 TB Transfer',
      '40 Gbps In / 4 Gbps Out',
    ],
  },
  {
    id: 'g6-metal-2',
    label: 'Linode 4GB',
    price: {
      hourly: 0.03,
      monthly: 20,
    },

    memory: 4096,
    disk: 81920,
    transfer: 4000,
    vcpus: 2,

    network_out: 4000,
    class: 'metal',

    formattedLabel: 'Linode 4 GB',
    heading: 'Linode 4 GB',
    subHeadings: [
      '$20/mo ($0.03/hr)',
      '2 CPU, 80 GB Storage, 4 GB RAM',
      '4 TB Transfer',
      '40 Gbps In / 4 Gbps Out',
    ],
  },
  {
    id: 'g6-premium-2',
    label: 'Linode 4GB',
    price: {
      hourly: 0.03,
      monthly: 20,
    },

    memory: 4096,
    disk: 81920,
    transfer: 4000,
    vcpus: 2,

    network_out: 4000,
    class: 'premium',

    formattedLabel: 'Linode 4 GB',
    heading: 'Linode 4 GB',
    subHeadings: [
      '$20/mo ($0.03/hr)',
      '2 CPU, 80 GB Storage, 4 GB RAM',
      '4 TB Transfer',
      '40 Gbps In / 4 Gbps Out',
    ],
  },
];
describe('filterPlanSelectionTypes', () => {
  it('should filter plan selection types correctly', () => {
    const filteredPlans: FilteredPlanSelectionTypes = filterPlanSelectionTypes(
      types
    );

    expect(filteredPlans.nanodes).toEqual([types[0]]);
    expect(filteredPlans.standards).toEqual([types[1], types[2]]);
    expect(filteredPlans.highmem).toEqual([types[3]]);
    expect(filteredPlans.proDedicated).toEqual([types[4]]);
    expect(filteredPlans.dedicated).toEqual([types[5]]);
    expect(filteredPlans.gpu).toEqual([types[6]]);
    expect(filteredPlans.metal).toEqual([types[7]]);
    expect(filteredPlans.premium).toEqual([types[8]]);
  });
});
