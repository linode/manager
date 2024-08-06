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

export type MockPresetId =
  | 'account-managed-disabled'
  | 'account-managed-enabled'
  | 'api-response-time'
  | 'baseline-account-activation'
  | 'baseline-api-maintenance'
  | 'baseline-api-offline'
  | 'baseline-api-unstable'
  | 'baseline-crud'
  | 'baseline-legacy'
  | 'baseline-no-mocks'
  | 'legacy-test-regions'
  | 'linodes-crud'
  | 'parent-child-child-account-proxy-user'
  | 'parent-child-parent-account-user'
  | 'placementGroups-crud'
  | 'prod-regions'
  | 'volumes-crud';

export type MockPreset = {
  /**
   * If true, it means the preset can set a value via a number input.
   */
  canUpdateCount?: boolean;

  /** Description of mock preset and its purpose. */
  desc?: string;

  /** Group to which preset belongs. Used to sort presets in dev tool UI. */
  group: MockPresetGroup;

  /** Array of MSW handler generator functions. */
  handlers: MockHandler[];

  /** Unique ID of mock preset, used to keep track of user preset selections. */
  id: MockPresetId;

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

export type MockSeederId =
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
  /**
   * If true, it means the seeder can set a value via a number input.
   */
  canUpdateCount?: boolean;

  /** Description of mock seeder and its purpose. */
  desc?: string;

  /** Group to which seeder belongs. Used to sort seeders in dev tool UI. */
  group?: MockSeederGroup;

  /** Unique ID of mock seeder, used to keep track of user seeder selections. */
  id: MockSeederId;

  /** Human-readable label for mock seeder. */
  label: string;

  /** Function that updates the mock state. */
  seeder: (mockState: MockState) => MockState | Promise<MockState>;
}
