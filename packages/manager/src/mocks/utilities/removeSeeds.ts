import { mockState } from 'src/dev-tools/load';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockContextSeeder } from 'src/mocks/types';

export const removeSeeds = async (populatorId: MockContextSeeder['id']) => {
  switch (populatorId) {
    case 'many-linodes':
      await mswDB.deleteAll('linodes', mockState, 'seedContext');
      await mswDB.deleteAll('linodeConfigs', mockState, 'seedContext');
      break;
    case 'legacy-test-regions':
    case 'prod-regions':
    case 'edge-regions':
      await mswDB.deleteAll('regions', mockState, 'seedContext');
      break;
    default:
      break;
  }

  return mockState;
};
