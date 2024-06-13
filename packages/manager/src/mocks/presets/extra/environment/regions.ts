import { getRegions } from 'src/mocks/handlers/region-handlers';
import type { MockPreset } from 'src/mocks/mockPreset';

export const regionsPreset: MockPreset = {
  label: 'Regions',
  id: 'regions',
  desc: 'Mock Linode regions',
  group: 'Environment',
  handlers: [getRegions],
};
