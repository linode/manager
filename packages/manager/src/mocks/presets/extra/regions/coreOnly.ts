import { http } from 'msw';

import { productionRegions } from 'src/__data__/productionRegionsData';
import { makePaginatedResponse } from 'src/mocks/utilities/response';

import type { MockPresetExtra } from 'src/mocks/types';

const mockCoreOnlyRegions = () => {
  return [
    http.get('*/v4/regions', ({ request }) => {
      return makePaginatedResponse({
        data: productionRegions,
        request,
      });
    }),
  ];
};

export const coreOnlyRegionsPreset: MockPresetExtra = {
  desc: 'Core Only Regions',
  group: { id: 'Regions', type: 'select' },
  handlers: [mockCoreOnlyRegions],
  id: 'regions:core-only',
  label: 'Core Only',
};
