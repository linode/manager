import type { Linode, Config, Volume } from '@linode/api-v4';

/**
 * Contextual data shared among mocks.
 */
export interface MockContext {
  linodes: Linode[];
  linodeConfigs: [number, Config][];

  volumes: Volume[];
}

export interface MockContextPopulator {
  label: string;
  id: string;
  description: string;
  populator: (mockContext: MockContext) => MockContext;
}

/**
 * Creates and returns an empty mock context.
 *
 * @returns Empty mock context.
 */
export const makeMockContext = (): MockContext => {
  return {
    linodes: [],
    linodeConfigs: [],
    volumes: [],
  };
};
