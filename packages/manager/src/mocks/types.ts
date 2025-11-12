/* eslint-disable perfectionist/sort-interfaces */
import type {
  AccountRoleType,
  ChildAccount,
  CloudNAT,
  Config,
  Destination,
  Domain,
  DomainRecord,
  Entity,
  EntityByPermission,
  EntityRoleType,
  Event,
  Firewall,
  FirewallDevice,
  IamAccountRoles,
  IamUserRoles,
  Image,
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
  User,
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
  | 'Profile & Grants'
  | 'Regions'
  | 'User Permissions';

export type MockPresetExtraGroupType =
  | 'account'
  | 'checkbox'
  | 'events'
  | 'maintenance'
  | 'notifications'
  | 'profile & grants'
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
  | 'profile-grants:custom'
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
    | 'Child Accounts'
    | 'CloudNATs'
    | 'Delivery'
    | 'Domains'
    | 'Entities'
    | 'Firewalls'
    | 'Images'
    | 'IP Addresses'
    | 'Kubernetes'
    | 'Linodes'
    | 'NodeBalancers'
    | 'Permissions'
    | 'Placement Groups'
    | 'Quotas'
    | 'Support Tickets'
    | 'Users'
    | 'Volumes'
    | 'VPCs';
};
export type MockPresetCrudId =
  | 'child-accounts-for-user:crud'
  | 'child-accounts:crud'
  | 'cloudnats:crud'
  | 'delivery:crud'
  | 'domains:crud'
  | 'entities:crud'
  | 'firewalls:crud'
  | 'images:crud'
  | 'ip-addresses:crud'
  | 'kubernetes:crud'
  | 'linodes:crud'
  | 'nodebalancers:crud'
  | 'permissions:crud'
  | 'placement-groups:crud'
  | 'quotas:crud'
  | 'support-tickets:crud'
  | 'users(default):crud'
  | 'users(parent):crud'
  | 'users:crud'
  | 'volumes:crud'
  | 'vpcs:crud';
export interface MockPresetCrud extends MockPresetBase {
  canUpdateCount?: boolean;
  group: MockPresetCrudGroup;
  id: MockPresetCrudId;
}

export type MockHandler = (mockState: MockState) => HttpHandler[];

export interface Delegation {
  childAccountEuuid: string;
  id: number;
  username: string;
}

export interface UserRolesEntry {
  username: string;
  roles: IamUserRoles;
}

export interface UserAccountPermissionsEntry {
  username: string;
  permissions: AccountRoleType[];
}

export interface UserEntityPermissionsEntry {
  username: string;
  entityType: string;
  entityId: number | string;
  permissions: EntityRoleType[];
}

/**
 * Stateful data shared among mocks.
 */
export interface MockState {
  userEntitiesByPermission: EntityByPermission[];
  childAccounts: ChildAccount[];
  cloudnats: CloudNAT[];
  configInterfaces: [number, Interface][]; // number is Config ID
  delegations: Delegation[];
  destinations: Destination[];
  domainRecords: DomainRecord[];
  domains: Domain[];
  entities: Entity[];
  eventQueue: Event[];
  firewallDevices: [number, FirewallDevice][]; // number is Firewall ID
  firewalls: Firewall[];
  images: Image[];
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
  users: User[];
  volumes: Volume[];
  vpcs: VPC[];
  vpcsIps: VPCIP[];

  // IAM Permission-related fields
  accountRoles: IamAccountRoles[];
  userRoles: UserRolesEntry[];
  userAccountPermissions: UserAccountPermissionsEntry[];
  userEntityPermissions: UserEntityPermissionsEntry[];
}

export interface MockSeeder extends Omit<MockPresetCrud, 'handlers'> {
  /** Function that updates the mock state. */
  seeder: (mockState: MockState) => MockState | Promise<MockState>;
}
