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

export type MockPresetBase = {
  /** Description of mock preset and its purpose. */
  desc?: string;

  /** Array of MSW handler generator functions. */
  handlers: MockHandler[];

  /** Human-readable label for mock preset. */
  label: string;
};

/**
 * Mock Preset Baseline
 */
export type MockPresetBaselineGroup = {
  id: 'API State' | 'Account State' | 'General';
};
export type MockPresetBaselineId =
  | 'baseline:account-activation'
  | 'baseline:api-maintenance'
  | 'baseline:api-offline'
  | 'baseline:api-unstable'
  | 'baseline:crud'
  | 'baseline:legacy'
  | 'baseline:preset-mocking';
export interface MockPresetBaseline extends MockPresetBase {
  group: MockPresetBaselineGroup;
  id: MockPresetBaselineId;
}

/**
 * Mock Preset Extra
 */
export type MockPresetExtraGroup = {
  id: 'API' | 'Account' | 'Limits' | 'Managed' | 'Regions';
  type: 'checkbox' | 'select';
};
export type MockPresetExtraId =
  | 'account:child-proxy'
  | 'account:managed-disabled'
  | 'account:managed-enabled'
  | 'account:parent'
  | 'api:response-time'
  | 'limits:linode-limits'
  | 'limits:lke-limits'
  | 'regions:core-and-distributed'
  | 'regions:core-only'
  | 'regions:legacy';

export interface MockPresetExtra extends MockPresetBase {
  canUpdateCount?: boolean;
  group: MockPresetExtraGroup;
  id: MockPresetExtraId;
}

/**
 * Mock Preset Crud
 */
export type MockPresetCrudGroup = {
  id: 'Linodes' | 'Placement Groups' | 'Volumes';
};
export type MockPresetCrudId =
  | 'linodes:crud'
  | 'placement-groups:crud'
  | 'volumes:crud';
export interface MockPresetCrud extends MockPresetBase {
  canUpdateCount?: boolean;
  group: MockPresetCrudGroup;
  id: MockPresetCrudId;
}

export type MockHandler = (mockState: MockState) => HttpHandler[];

/**
 * Stateful data shared among mocks.
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

export interface MockSeeder extends Omit<MockPresetCrud, 'handlers'> {
  /** Function that updates the mock state. */
  seeder: (mockState: MockState) => MockState | Promise<MockState>;
}
