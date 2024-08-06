import { http } from 'msw';

import { distributedRegions } from 'src/__data__/distributedRegionsData';
import { productionRegions } from 'src/__data__/productionRegionsData';
import { makePaginatedResponse } from 'src/mocks/utilities/response';

import type { MockPreset } from 'src/mocks/types';

// We include both production and distributed regions in this preset for convenience.
const mockProductionRegions = () => {
  return [
    http.get('*/v4/regions', ({ request }) => {
      return makePaginatedResponse({
        data: [...productionRegions, ...distributedRegions],
        request,
      });
    }),
  ];
};

export const regionsPreset: MockPreset = {
  desc: 'Production-like Regions',
  group: 'Regions',
  handlers: [mockProductionRegions],
  id: 'prod-regions',
  label: 'Core + Distributed',
};
