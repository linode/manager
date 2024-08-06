import { http } from 'msw';

import { regions } from 'src/__data__/regionsData';
import { makePaginatedResponse } from 'src/mocks/utilities/response';

import type { MockPreset } from 'src/mocks/types';

const mockLegacyRegions = () => {
  return [
    http.get('*/v4/regions', ({ request }) => {
      return makePaginatedResponse({
        data: regions,
        request,
      });
    }),
  ];
};

export const legacyRegionsPreset: MockPreset = {
  desc: 'Legacy regions',
  group: 'Regions',
  handlers: [mockLegacyRegions],
  id: 'legacy-test-regions',
  label: 'Legacy',
};
