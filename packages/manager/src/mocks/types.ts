import type {
  Config,
  Domain,
  DomainRecord,
  Event,
  Firewall,
  FirewallDevice,
  IPAddress,
  KubeNodePoolResponse,
  KubernetesCluster,
  Linode,
  LinodeInterface,
  NodeBalancer,
  NodeBalancerConfig,
  NodeBalancerConfigNode,
  Notification,
  PlacementGroup,
  Region,
  RegionAvailability,
  Subnet,
  SupportReply,
  SupportTicket,
  Volume,
  VPC,
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
  id: 'Account State' | 'API State' | 'General';
};
export type MockPresetBaselineId =
  | 'baseline:account-activation'
  | 'baseline:api-maintenance'
  | 'baseline:api-offline'
  | 'baseline:api-unstable'
  | 'baseline:crud'
  | 'baseline:legacy'
  | 'baseline:static-mocking';
export interface MockPresetBaseline extends MockPresetBase {
  group: MockPresetBaselineGroup;
  id: MockPresetBaselineId;
}

/**
 * Mock Preset Extra
 */
export type MockPresetExtraGroup = {
  id:
    | 'Account'
    | 'API'
    | 'Capabilities'
    | 'Limits'
    | 'Managed'
    | 'Profile'
    | 'Regions';
  type: 'account' | 'checkbox' | 'profile' | 'select';
};
export type MockPresetExtraId =
  | 'account:custom'
  | 'account:managed-disabled'
  | 'account:managed-enabled'
  | 'api:response-time'
  | 'limits:linode-limits'
  | 'limits:lke-limits'
  | 'profile:custom'
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
  id:
    | 'Domains'
    | 'Firewalls'
    | 'IP Addresses'
    | 'Kubernetes'
    | 'Linodes'
    | 'NodeBalancers'
    | 'Placement Groups'
    | 'Quotas'
    | 'Support Tickets'
    | 'Volumes'
    | 'VPCs';
};
export type MockPresetCrudId =
  | 'domains:crud'
  | 'firewalls:crud'
  | 'ip-addresses:crud'
  | 'kubernetes:crud'
  | 'linodes:crud'
  | 'nodebalancers:crud'
  | 'placement-groups:crud'
  | 'quotas:crud'
  | 'support-tickets:crud'
  | 'volumes:crud'
  | 'vpcs:crud';
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
  domainRecords: DomainRecord[];
  domains: Domain[];
  eventQueue: Event[];
  firewallDevices: [number, FirewallDevice][];
  firewalls: Firewall[];
  ipAddresses: IPAddress[];
  kubernetesClusters: KubernetesCluster[];
  kubernetesNodePools: KubeNodePoolResponse[];
  linodeConfigs: [number, Config][];
  linodeInterfaces: [number, LinodeInterface][];
  linodes: Linode[];
  nodeBalancerConfigNodes: NodeBalancerConfigNode[];
  nodeBalancerConfigs: NodeBalancerConfig[];
  nodeBalancers: NodeBalancer[];
  notificationQueue: Notification[];
  placementGroups: PlacementGroup[];
  regionAvailability: RegionAvailability[];
  regions: Region[];
  subnets: [number, Subnet][];
  supportReplies: SupportReply[];
  supportTickets: SupportTicket[];
  volumes: Volume[];
  vpcs: VPC[];
}

export interface MockSeeder extends Omit<MockPresetCrud, 'handlers'> {
  /** Function that updates the mock state. */
  seeder: (mockState: MockState) => MockState | Promise<MockState>;
}
