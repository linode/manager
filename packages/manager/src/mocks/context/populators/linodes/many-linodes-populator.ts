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
    const seedContext = await mswDB.getStore('seedContext');
    const linodes = linodeFactory.buildList(5000);
    const configs: [number, Config][] = linodes.map((linode) => {
      return [linode.id, configFactory.build()];
    });

    // We don't want to cumulatively add Linodes and configs to the DB.
    // The seed DB is a reference to seeds already added to the DB.
    // If the seed DB is empty, we know we haven't added these Linodes yet.
    // We could also check the length of the linodes array in the mockContext,
    // but this is a bit more reliable and we need the seed DB for other things (such as removing only seeds when turning the populator off).
    if (seedContext?.linodes.length === 0) {
      await mswDB.addMany('linodes', linodes, mockContext, 'mockContext');
      await mswDB.addMany('linodeConfigs', configs, mockContext, 'mockContext');
      await mswDB.addMany('linodes', linodes, undefined, 'seedContext');
      await mswDB.addMany('linodeConfigs', configs, undefined, 'seedContext');
    }

    return mockContext;
  },
};
