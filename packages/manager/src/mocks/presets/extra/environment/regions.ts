import { getRegions } from 'src/mocks/handlers/region-handlers';

import type { MockPreset } from 'src/mocks/types';

export const regionsPreset: MockPreset = {
  desc: 'Mock Linode regions',
  group: 'Environment',
  handlers: [getRegions],
  id: 'regions',
  label: 'Regions',
};
