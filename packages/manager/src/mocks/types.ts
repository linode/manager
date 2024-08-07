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
export type MockPresetBaselineGroupId =
  | 'baseline:account-activation'
  | 'baseline:api-maintenance'
  | 'baseline:api-offline'
  | 'baseline:api-unstable'
  | 'baseline:crud'
  | 'baseline:legacy'
  | 'baseline:no-mocks';
export interface MockPresetBaseline extends MockPresetBase {
  group: MockPresetBaselineGroup;
  id: MockPresetBaselineGroupId;
}

/**
 * Mock Preset Extra
 */
export type MockPresetExtraGroup = {
  id: 'API' | 'Account' | 'Managed' | 'Regions';
  type: 'multiple' | 'single';
};
export type MockPresetExtraGroupId =
  | 'account:managed-disabled'
  | 'account:managed-enabled'
  | 'api:response-time'
  | 'parent-child-account:child-proxy'
  | 'parent-child-account:parent'
  | 'regions:core-and-distributed'
  | 'regions:core-only'
  | 'regions:legacy';
export interface MockPresetExtra extends MockPresetBase {
  canUpdateCount?: boolean;
  group: MockPresetExtraGroup;
  id: MockPresetExtraGroupId;
}

/**
 * Mock Preset Crud
 */
export type MockPresetCrudGroup = {
  id: 'Linodes' | 'Placement Groups' | 'Volumes';
};
export type MockPresetCrudGroupId =
  | 'linodes:crud'
  | 'placement-groups:crud'
  | 'volumes:crud';
export interface MockPresetCrud extends MockPresetBase {
  canUpdateCount?: boolean;
  group: MockPresetCrudGroup;
  id: MockPresetCrudGroupId;
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
