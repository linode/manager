import { http } from 'msw';

import { distributedRegions } from 'src/__data__/distributedRegionsData';
import { productionRegions } from 'src/__data__/productionRegionsData';
import { makePaginatedResponse } from 'src/mocks/utilities/response';

import type { MockPresetExtra } from 'src/mocks/types';

const mockCoreAndDistributedRegions = () => {
  return [
    http.get('*/v4/regions', ({ request }) => {
      return makePaginatedResponse({
        data: [...productionRegions, ...distributedRegions],
        request,
      });
    }),
  ];
};

export const coreAndDistributedRegionsPreset: MockPresetExtra = {
  desc: 'Core and Distributed Regions',
  group: { id: 'Regions', type: 'select' },
  handlers: [mockCoreAndDistributedRegions],
  id: 'regions:core-and-distributed',
  label: 'Core + Distributed',
};
