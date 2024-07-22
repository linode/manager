import { mockState } from 'src/dev-tools/load';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockSeeder } from 'src/mocks/types';

export const removeSeeds = async (seederId: MockSeeder['id']) => {
  switch (seederId) {
    case 'many-linodes':
      await mswDB.deleteAll('linodes', mockState, 'seedState');
      await mswDB.deleteAll('linodeConfigs', mockState, 'seedState');
      break;
    case 'legacy-test-regions':
    case 'prod-regions':
    case 'edge-regions':
      await mswDB.deleteAll('regions', mockState, 'seedState');
      break;
    default:
      break;
  }

  return mockState;
};
