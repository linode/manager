import { mockState } from 'src/dev-tools/load';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockContext } from 'src/mocks/types';

export const removeSeeds = async (populatorId: string) => {
  const seedContext = await mswDB.getStore('seedContext');
  const mockContext = await mswDB.getStore('mockContext');

  /**
   * This function is used to find seeds in the mock context by looking at the seed DB.
   * It then returns the indexes of the seeds in the mock context.
   */
  const getItemsToRemove = (key: keyof MockContext): number[] | undefined => {
    if (!seedContext || !mockContext) {
      return;
    }
    const seeds = seedContext[key];
    const mockContextItems = mockContext[key];

    if (seeds.length === 0) {
      return;
    }

    return seeds.reduce((acc: number[], seed) => {
      const index = mockContextItems.findIndex((item) => {
        if (!hasId(item) || !hasId(seed)) {
          return false;
        }

        return item.id === seed.id;
      });

      if (index !== -1) {
        acc.push(index);
      }

      return acc;
    }, []);
  };

  switch (populatorId) {
    case 'many-linodes':
      const linodesToRemove = getItemsToRemove('linodes');
      const linodeConfigsToRemove = getItemsToRemove('linodeConfigs');

      if (linodesToRemove && linodeConfigsToRemove) {
        await mswDB.removeMany(
          'linodes',
          linodesToRemove,
          mockState,
          'mockContext'
        );
        await mswDB.removeMany(
          'linodeConfigs',
          linodeConfigsToRemove,
          mockState,
          'mockContext'
        );
        await mswDB.removeMany(
          'linodes',
          linodesToRemove,
          undefined,
          'seedContext'
        );
        await mswDB.removeMany(
          'linodeConfigs',
          linodeConfigsToRemove,
          undefined,
          'seedContext'
        );
      }
      break;
    default:
      break;
  }

  return mockState;
};

type WithId = {
  id: unknown;
};

// Type guard to check if an object has an 'id' property
const hasId = (obj: any): obj is WithId => {
  return 'id' in obj;
};
