import type { MockContext, MockContextPopulator } from 'src/mocks/mockContext';
import type { Config } from '@linode/api-v4';

import { linodeFactory, configFactory } from 'src/factories';

/**
 * Populates context with 5,000 Linodes.
 * Useful for testing landing page pagination, list and search performance, etc.
 */
export const manyLinodesPopulator: MockContextPopulator = {
  label: 'Many Linodes',
  id: 'many-linodes',
  description: 'Populates context with 5,000 Linodes',
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
