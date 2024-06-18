import type {
  Linode,
  Config,
  Volume,
  Event,
  Notification,
  Region,
  RegionAvailability,
} from '@linode/api-v4';

/**
 * Describes a function that executes on each request to the events endpoint.
 *
 * Can be used to simulate progress or update state in response to an event.
 *
 * @returns `true` if event is considered complete, `false` if callback should continue to be called.
 */
export type MockEventProgressHandler = (
  event: Event,
  context: MockContext
) => boolean;

/**
 * Contextual data shared among mocks.
 */
export interface MockContext {
  // Linodes and related data.
  linodes: Linode[];
  linodeConfigs: [number, Config][];

  // Volumes.
  volumes: Volume[];

  // Environment.
  regions: Region[];
  regionAvailability: RegionAvailability[];

  // Misc.
  eventQueue: [Event, MockEventProgressHandler | null][];
  notificationQueue: Notification[];
}

export interface MockContextPopulator {
  label: string;
  id: string;
  group?: string;
  desc?: string;
  populator: (mockContext: MockContext) => MockContext;
}

export const getContextPopulatorGroups = (
  populators: MockContextPopulator[]
): Array<string | undefined> => {
  return populators.reduce((acc: Array<string | undefined>, cur) => {
    if (!acc.includes(cur.group)) {
      acc.push(cur.group);
    }
    return acc;
  }, []);
};

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
    regions: [],
    regionAvailability: [],
    eventQueue: [],
    notificationQueue: [],
  };
};
