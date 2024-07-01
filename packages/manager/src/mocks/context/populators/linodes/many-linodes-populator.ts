import { configFactory, linodeFactory } from 'src/factories';

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

  populator: (mockContext: MockContext) => {
    const linodes = linodeFactory.buildList(5000);
    const configs: [number, Config][] = linodes.map((linode) => {
      return [linode.id, configFactory.build()];
    });

    mockContext.linodes.push(...linodes);
    mockContext.linodeConfigs.push(...configs);

    return mockContext;
  },
};
