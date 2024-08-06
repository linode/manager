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
  | 'Firewalls'
  | 'General'
  | 'Linodes'
  | 'Placement Groups'
  | 'Regions'
  | 'Volumes';

export type MockHandler = (mockState: MockState) => HttpHandler[];

export type MockPreset = {
  /**
   * Whether the preset is always enabled.
   * If true, it means the preset can be disabled via a custom value provided in a number input.
   * This is currently used to simulate API response times.
   */
  alwaysEnabled?: boolean;

  /** Description of mock preset and its purpose. */
  desc?: string;

  /** Group to which preset belongs. Used to sort presets in dev tool UI. */
  group: MockPresetGroup;

  /** Array of MSW handler generator functions. */
  handlers: MockHandler[];

  /** Unique ID of mock preset, used to keep track of user preset selections. */
  id: string;

  /** Human-readable label for mock preset. */
  label: string;
};

/**
 * Stateual data shared among mocks.
 */
export interface MockState {
  eventQueue: Event[];
  firewalls: Firewall[];
  linodeConfigs: [number, Config][];
  linodes: Linode[];
  notificationQueue: Notification[];
  placementGroups: PlacementGroup[];
  regionAvailability: RegionAvailability[];
  regions: Region[];
  volumes: Volume[];
}

export type MockSeederIds =
  | 'edge-regions'
  | 'legacy-test-regions'
  | 'many-linodes'
  | 'many-placement-groups'
  | 'many-volumes'
  | 'prod-regions';

type MockSeederGroup =
  | 'Account'
  | 'Linodes'
  | 'Placement Groups'
  | 'Regions'
  | 'Volumes';

export interface MockSeeder {
  canUpdateCount?: boolean;
  desc?: string;
  group?: MockSeederGroup;
  id: MockSeederIds;
  label: string;
  seeder: (mockState: MockState) => MockState | Promise<MockState>;
}
