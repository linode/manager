import type {
  CloudNAT,
  Config,
  Destination,
  Domain,
  DomainRecord,
  Event,
  Firewall,
  FirewallDevice,
  Interface,
  IPAddress,
  KubeNodePoolResponse,
  KubernetesCluster,
  Linode,
  LinodeInterface,
  LinodeIPsResponse,
  NodeBalancer,
  NodeBalancerConfig,
  NodeBalancerConfigNode,
  Notification,
  PlacementGroup,
  Region,
  RegionAvailability,
  Stream,
  Subnet,
  SupportReply,
  SupportTicket,
  Volume,
  VPC,
  VPCIP,
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
  id: MockPresetExtraGroupId;
  type: MockPresetExtraGroupType;
};

export type MockPresetExtraGroupId =
  | 'Account'
  | 'API'
  | 'Capabilities'
  | 'Events'
  | 'Limits'
  | 'Maintenance'
  | 'Managed'
  | 'Notifications'
  | 'Profile'
  | 'Regions'
  | 'User Permissions';

export type MockPresetExtraGroupType =
  | 'account'
  | 'checkbox'
  | 'events'
  | 'maintenance'
  | 'notifications'
  | 'profile'
  | 'select'
  | 'userPermissions';

export type MockPresetExtraId =
  | 'account:custom'
  | 'account:managed-disabled'
  | 'account:managed-enabled'
  | 'api:response-time'
  | 'events:custom'
  | 'limits:linode-limits'
  | 'limits:lke-limits'
  | 'maintenance:custom'
  | 'notifications:custom'
  | 'profile:custom'
  | 'regions:core-and-distributed'
  | 'regions:core-only'
  | 'regions:legacy'
  | 'userAccountPermissions:custom'
  | 'userEntityPermissions:custom';

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
    | 'CloudNATs'
    | 'DataStream'
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
  | 'cloudnats:crud'
  | 'datastream:crud'
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
  cloudnats: CloudNAT[];
  configInterfaces: [number, Interface][]; // number is Config ID
  destinations: Destination[];
  domainRecords: DomainRecord[];
  domains: Domain[];
  eventQueue: Event[];
  firewallDevices: [number, FirewallDevice][]; // number is Firewall ID
  firewalls: Firewall[];
  ipAddresses: IPAddress[];
  kubernetesClusters: KubernetesCluster[];
  kubernetesNodePools: KubeNodePoolResponse[];
  linodeConfigs: [number, Config][]; // number is Linode ID
  linodeInterfaces: [number, LinodeInterface][]; // number is Linode ID
  linodeIps: [number, LinodeIPsResponse][]; // number is Linode ID
  linodes: Linode[];
  nodeBalancerConfigNodes: NodeBalancerConfigNode[];
  nodeBalancerConfigs: NodeBalancerConfig[];
  nodeBalancers: NodeBalancer[];
  notificationQueue: Notification[];
  placementGroups: PlacementGroup[];
  regionAvailability: RegionAvailability[];
  regions: Region[];
  streams: Stream[];
  subnets: [number, Subnet][]; // number is VPC ID
  supportReplies: SupportReply[];
  supportTickets: SupportTicket[];
  volumes: Volume[];
  vpcs: VPC[];
  vpcsIps: VPCIP[];
}

export interface MockSeeder extends Omit<MockPresetCrud, 'handlers'> {
  /** Function that updates the mock state. */
  seeder: (mockState: MockState) => MockState | Promise<MockState>;
}
