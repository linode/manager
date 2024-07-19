import { mockState } from 'src/dev-tools/load';
import { mswDB } from 'src/mocks/indexedDB';

export const removeSeeds = async (populatorId: string) => {
  switch (populatorId) {
    case 'many-linodes':
      await mswDB.deleteAll('linodes', mockState, 'seedContext');
      await mswDB.deleteAll('linodeConfigs', mockState, 'seedContext');
      break;
    default:
      break;
  }

  return mockState;
};
