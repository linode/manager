import { getRegions } from 'src/mocks/handlers/region-handlers';

import type { MockPreset } from 'src/mocks/types';

export const regionsCrudPreset: MockPreset = {
  group: 'Regions',
  handlers: [getRegions],
  id: 'regions',
  label: 'Regions',
};
