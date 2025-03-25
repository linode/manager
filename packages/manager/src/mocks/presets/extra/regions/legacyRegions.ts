import { regions } from '@linode/utilities';
import { http } from 'msw';

import { makePaginatedResponse } from 'src/mocks/utilities/response';

import type { MockPresetExtra } from 'src/mocks/types';

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

export const legacyRegionsPreset: MockPresetExtra = {
  desc: 'Legacy regions',
  group: { id: 'Regions', type: 'select' },
  handlers: [mockLegacyRegions],
  id: 'regions:legacy',
  label: 'Legacy',
};
