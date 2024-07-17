import type {
  Config,
  Event,
  Firewall,
  Linode,
  Notification,
  PlacementGroup,
  Region,
  RegionAvailability,
  Volume,
} from '@linode/api-v4';
import type { HttpHandler } from 'msw';

export type MockPresetGroup =
  | 'API State'
  | 'Account State'
  | 'Account'
  | 'Environment'
  | 'Firewalls'
  | 'General'
  | 'Linodes'
  | 'Placement Groups'
  | 'Volumes';

export type MockHandlerGenerator = (mockContext: MockContext) => HttpHandler[];

export type MockPreset = {
  /** Description of mock preset and its purpose. */
  desc?: string;

  /** Group to which preset belongs. Used to sort presets in dev tool UI. */
  group: MockPresetGroup;

  /** Array of MSW handler generator functions. */
  handlers: MockHandlerGenerator[];

  /** Unique ID of mock preset, used to keep track of user preset selections. */
  id: string;

  /** Human-readable label for mock preset. */
  label: string;
};

export type MockEventProgressHandler = (
  event: Event,
  context: MockContext
) => boolean;

/**
 * Contextual data shared among mocks.
 */
export interface MockContext {
  eventQueue: [Event, MockEventProgressHandler | null][];
  firewalls: Firewall[];
  linodeConfigs: [number, Config][];
  linodes: Linode[];
  notificationQueue: Notification[];
  placementGroups: PlacementGroup[];
  regionAvailability: RegionAvailability[];
  regions: Region[];
  volumes: Volume[];
}

export interface MockContextPopulator {
  desc?: string;
  group?: string;
  id: string;
  label: string;
  populator: (mockContext: MockContext) => MockContext | Promise<MockContext>;
}
