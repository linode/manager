import { configFactory, linodeFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { Config } from '@linode/api-v4';
import type { MockContext, MockContextPopulator } from 'src/mocks/types';

/**
 * Populates context with 5,000 Linodes.
 * Useful for testing landing page pagination, list and search performance, etc.
 */
export const manyLinodesPopulator: MockContextPopulator = {
  desc: 'Populates context with 5,000 Linodes',
  group: 'Linodes',
  id: 'many-linodes',
  label: 'Many Linodes',

  populator: async (mockContext: MockContext) => {
    const linodes = linodeFactory.buildList(5000);
    const configs: [number, Config][] = linodes.map((linode) => {
      return [linode.id, configFactory.build()];
    });

    const updatedMockContext = {
      ...mockContext,
      linodes: mockContext.linodes.concat(linodes),
      linodeConfigs: mockContext.linodeConfigs.concat(configs),
    };

    await mswDB.saveStore(updatedMockContext, 'seedContext');

    return updatedMockContext;
  },
};
