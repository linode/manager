import type {
  Linode,
  Config,
  Volume,
  Event,
  Notification,
} from '@linode/api-v4';

/**
 * Contextual data shared among mocks.
 */
export interface MockContext {
  // Linodes and related data.
  linodes: Linode[];
  linodeConfigs: [number, Config][];

  // Volumes.
  volumes: Volume[];

  // Misc.
  eventQueue: Event[];
  notificationQueue: Notification[];
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
    eventQueue: [],
    notificationQueue: [],
  };
};
