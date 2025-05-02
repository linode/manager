import type { IPAddress, IPRange } from '../networking/types';
import type { LinodePlacementGroupPayload } from '../placement-groups/types';
import type { Region, RegionSite } from '../regions';
import type {
  CreateLinodeInterfaceSchema,
  ModifyLinodeInterfaceSchema,
  RebuildLinodeSchema,
  UpdateLinodeInterfaceSettingsSchema,
  UpgradeToLinodeInterfaceSchema,
} from '@linode/validation';
import type { MaintenancePolicyId } from 'src/account';
import type { VPCIP } from 'src/vpcs';
import type { InferType } from 'yup';

export type Hypervisor = 'kvm' | 'zen';

export type EncryptionStatus = 'disabled' | 'enabled';

export type InterfaceGenerationType = 'legacy_config' | 'linode';

export interface LinodeSpecs {
  accelerated_devices: number;
  disk: number;
  gpus: number;
  memory: number;
  transfer: number;
  vcpus: number;
}

export interface Linode {
  alerts: LinodeAlerts;
  backups: LinodeBackups;
  capabilities: LinodeCapabilities[];
  created: string;
  disk_encryption?: EncryptionStatus; // @TODO LDE: Remove optionality once LDE is fully rolled out
  group: string;
  hypervisor: Hypervisor;
  id: number;
  image: null | string;
  interface_generation?: InterfaceGenerationType; // @TODO Linode Interfaces - Remove optionality once fully rolled out
  ipv4: string[];
  ipv6: null | string;
  label: string;
  lke_cluster_id: null | number;
  maintenance_policy_id?: MaintenancePolicyId;
  placement_group?: LinodePlacementGroupPayload; // If not in a placement group, this will be excluded from the response.
  region: string;
  site_type: RegionSite;
  specs: LinodeSpecs;
  status: LinodeStatus;
  tags: string[];
  type: null | string;
  updated: string;
  watchdog_enabled: boolean;
}

export interface LinodeAlerts {
  cpu: number;
  io: number;
  network_in: number;
  network_out: number;
  transfer_quota: number;
}

export interface LinodeBackups {
  enabled: boolean;
  last_successful: null | string;
  schedule: LinodeBackupSchedule;
}

export type LinodeCapabilities =
  | 'Block Storage Encryption'
  | 'Block Storage Performance B1'
  | 'SMTP Enabled';

export type Window =
  | 'Scheduling'
  | 'W0'
  | 'W2'
  | 'W4'
  | 'W8'
  | 'W10'
  | 'W12'
  | 'W14'
  | 'W16'
  | 'W18'
  | 'W20'
  | 'W22';

export type Day =
  | 'Friday'
  | 'Monday'
  | 'Saturday'
  | 'Scheduling'
  | 'Sunday'
  | 'Thursday'
  | 'Tuesday'
  | 'Wednesday';

export interface LinodeBackupSchedule {
  day: Day | null;
  window: null | Window;
}

export interface LinodeBackupsResponse {
  automatic: LinodeBackup[];
  snapshot: {
    current: LinodeBackup | null;
    in_progress: LinodeBackup | null;
  };
}

export type Filesystem = 'ext3' | 'ext4' | 'initrd' | 'raw' | 'swap';

export interface LinodeBackupDisk {
  filesystem: Filesystem;
  label: string;
  size: number;
}

export interface LinodeBackup {
  available: boolean;
  configs: string[];
  created: string;
  disks: LinodeBackupDisk[];
  finished: string;
  id: number;
  label: null | string;
  region: string;
  status: LinodeBackupStatus;
  type: LinodeBackupType;
  updated: string;
}

export type LinodeBackupType = 'auto' | 'snapshot';

export type LinodeBackupStatus =
  | 'failed'
  | 'needsPostProcessing'
  | 'paused'
  | 'pending'
  | 'running'
  | 'successful'
  | 'userAborted';

export interface LinodeIPsResponse {
  ipv4: LinodeIPsResponseIPV4;
  ipv6?: LinodeIPsResponseIPV6;
}

export interface LinodeIPsResponseIPV4 {
  private: IPAddress[];
  public: IPAddress[];
  reserved: IPAddress[];
  shared: IPAddress[];
  vpc: VPCIP[];
}

export interface LinodeIPsResponseIPV6 {
  global: IPRange[];
  link_local: IPAddress;
  slaac: IPAddress;
}

export type LinodeStatus =
  | 'booting'
  | 'cloning'
  | 'deleting'
  | 'migrating'
  | 'offline'
  | 'provisioning'
  | 'rebooting'
  | 'rebuilding'
  | 'restoring'
  | 'running'
  | 'shutting_down'
  | 'stopped';

// ---------------------------------------------------------------------
// Types relating to legacy interfaces (Configuration profile Interfaces)
// ----------------------------------------------------------------------
export type InterfacePurpose = 'public' | 'vlan' | 'vpc';

// IPv4
export interface ConfigInterfaceIPv4 {
  nat_1_1?: null | string;
  vpc?: null | string;
}

export interface IPv6SLAAC {
  address: string;
  range: string;
}

export interface ConfigInterfaceIPv6 {
  is_public: boolean;
  ranges: {
    range?: string;
  }[];
  slaac: IPv6SLAAC[];
}

// The legacy interface type - for Configuration Profile Interfaces
export interface Interface {
  active: boolean;
  id: number;
  ip_ranges?: string[];
  ipam_address: null | string;
  ipv4?: ConfigInterfaceIPv4;
  ipv6?: ConfigInterfaceIPv6;
  label: null | string;
  primary?: boolean;
  purpose: InterfacePurpose;
  subnet_id?: null | number;
  vpc_id?: null | number;
}

export interface InterfacePayload {
  ip_ranges?: null | string[];
  /**
   * Used for VLAN, but is optional
   */
  ipam_address?: null | string;
  ipv4?: ConfigInterfaceIPv4;
  ipv6?: ConfigInterfaceIPv6;
  /**
   * Required to specify a VLAN
   */
  label?: null | string;
  primary?: boolean;
  purpose: InterfacePurpose;
  subnet_id?: null | number;
  vpc_id?: null | number;
}

export interface ConfigInterfaceOrderPayload {
  ids: number[];
}

export type UpdateConfigInterfacePayload = Pick<
  Interface,
  'ip_ranges' | 'ipv4' | 'ipv6' | 'primary'
>;

export interface Config {
  comments: string;
  created: string;
  devices: Devices;
  helpers: any;
  id: number;
  initrd: null | string;
  // If a Linode is using new Linode Interfaces, the interfaces in the Config object will be returned as null.
  interfaces: Interface[] | null;
  kernel: string;
  label: string;
  memory_limit: number;
  root_device: string;
  run_level: 'binbash' | 'default' | 'single';
  updated: string;
  virt_mode: 'fullvirt' | 'paravirt';
}

// ----------------------------------------------------------
// Types relating to new interfaces - Linode Interfaces
// ----------------------------------------------------------
export interface DefaultRoute {
  ipv4?: boolean;
  ipv6?: boolean;
}

export type CreateLinodeInterfacePayload = InferType<
  typeof CreateLinodeInterfaceSchema
>;

export type ModifyLinodeInterfacePayload = InferType<
  typeof ModifyLinodeInterfaceSchema
>;

// GET related types

// GET object
export interface LinodeInterface {
  created: string;
  default_route: DefaultRoute;
  id: number;
  mac_address: string;
  public: null | PublicInterfaceData;
  updated: string;
  version: number;
  vlan: null | {
    ipam_address: string;
    vlan_label: string;
  };
  vpc: null | VPCInterfaceData;
}

export interface LinodeInterfaces {
  interfaces: LinodeInterface[];
}

export interface LinodeInterfaceIPv6 {
  is_public: boolean;
  ranges: {
    range: string;
  }[];
  slaac: IPv6SLAAC[];
}

export interface VPCInterfaceData {
  ipv4?: {
    addresses: {
      address: string;
      nat_1_1_address?: string;
      primary: boolean;
    }[];
    ranges: { range: string }[];
  };
  ipv6?: LinodeInterfaceIPv6;
  subnet_id: number;
  vpc_id: number;
}

export interface PublicInterfaceData {
  ipv4: {
    addresses: {
      address: string;
      primary: boolean;
    }[];
    shared: {
      address: string;
      linode_id: number;
    }[];
  };
  ipv6: {
    ranges: {
      range: string;
      route_target: null | string;
    }[];
    shared: {
      range: string;
      route_target: null | string;
    }[];
    slaac: {
      address: string;
      prefix: string;
    }[];
  };
}

// Other Linode Interface types
export type LinodeInterfaceStatus = 'active' | 'deleted' | 'inactive';

export interface LinodeInterfaceHistory {
  created: string;
  event_id: number;
  interface_data: string; // will come in as JSON string object that we'll need to parse
  interface_history_id: number;
  interface_id: number;
  linode_id: number;
  status: LinodeInterfaceStatus;
  version: number;
}

export interface LinodeInterfaceSettings {
  default_route: {
    ipv4_eligible_interface_ids: number[];
    ipv4_interface_id?: null | number;
    ipv6_eligible_interface_ids: number[];
    ipv6_interface_id?: null | number;
  };
  network_helper: boolean;
}

export type LinodeInterfaceSettingsPayload = InferType<
  typeof UpdateLinodeInterfaceSettingsSchema
>;

export type UpgradeInterfacePayload = InferType<
  typeof UpgradeToLinodeInterfaceSchema
>;

export interface UpgradeInterfaceData {
  config_id: number;
  dry_run: boolean;
  interfaces: LinodeInterface[];
}

// ----------------------------------------------------------

export interface DiskDevice {
  disk_id: null | number;
}
export interface VolumeDevice {
  volume_id: null | number;
}

export interface Devices {
  sda: DiskDevice | null | VolumeDevice;
  sdb: DiskDevice | null | VolumeDevice;
  sdc: DiskDevice | null | VolumeDevice;
  sdd: DiskDevice | null | VolumeDevice;
  sde: DiskDevice | null | VolumeDevice;
  sdf: DiskDevice | null | VolumeDevice;
  sdg: DiskDevice | null | VolumeDevice;
  sdh: DiskDevice | null | VolumeDevice;
}

export type KernelArchitecture = 'i386' | 'x86_64';

export interface Kernel {
  architecture: KernelArchitecture;
  /**
   * @example 2009-10-26T04:00:00
   */
  built: string;
  deprecated: boolean;
  id: string;
  kvm: boolean;
  label: string;
  pvops: boolean;
  version: string;
}

export interface NetStats {
  in: [number, number][];
  out: [number, number][];
  private_in: [number, number][];
  private_out: [number, number][];
}

export interface StatsData {
  cpu: [number, number][];
  io: {
    io: [number, number][];
    swap: [number, number][];
  };
  netv4: NetStats;
  netv6: NetStats;
}

export interface Stats {
  data: StatsData;
  title: string;
}

export interface Disk {
  created: string;
  disk_encryption?: EncryptionStatus; // @TODO LDE: remove optionality once LDE is fully rolled out
  filesystem: Filesystem;
  id: number;
  label: string;
  size: number;
  status: DiskStatus;
  updated: string;
}

export type DiskStatus = 'deleting' | 'not ready' | 'ready';

export interface LinodeConfigCreationData {
  comments?: string;
  devices: Devices;
  helpers: {
    devtmpfs_automount: boolean;
    distro: boolean;
    modules_dep: boolean;
    network?: boolean;
    updatedb_disabled: boolean;
  };
  initrd: null | number | string;
  interfaces?: InterfacePayload[];
  kernel?: string;
  label: string;
  memory_limit?: number;
  root_device: string;
  run_level?: 'binbash' | 'default' | 'single';
  virt_mode?: 'fullvirt' | 'paravirt';
}

export interface PriceObject {
  hourly: null | number;
  monthly: null | number;
}

export interface RegionPriceObject extends PriceObject {
  id: Region['id'];
}

export interface BaseType {
  disk: number;
  id: string;
  label: string;
  memory: number;
  vcpus: number;
}
export interface LinodeType extends BaseType {
  accelerated_devices: number;
  addons: {
    backups: { price: PriceObject; region_prices: RegionPriceObject[] };
  };
  class: LinodeTypeClass;
  gpus: number;
  network_out: number;
  price: PriceObject;
  region_prices: RegionPriceObject[];
  successor: null | string;
  transfer: number;
}

export type LinodeTypeClass =
  | 'accelerated'
  | 'dedicated'
  | 'gpu'
  | 'highmem'
  | 'metal'
  | 'nanode'
  | 'premium'
  | 'prodedicated'
  | 'standard';

export interface IPAllocationRequest {
  public: boolean;
  type: 'ipv4';
}

export interface UserData {
  user_data: null | string;
}

export interface CreateLinodePlacementGroupPayload {
  /**
   * This parameter is silent in Cloud Manager, but still needs to be represented in the API types.
   *
   * @default false
   */
  compliant_only?: boolean;
  id: number;
}

export interface CreateLinodeRequest {
  /**
   * A list of public SSH keys that will be automatically appended to the root user’s
   * `~/.ssh/authorized_keys`file when deploying from an Image.
   */
  authorized_keys?: null | string[];
  /**
   * A list of usernames. If the usernames have associated SSH keys,
   * the keys will be appended to the root users `~/.ssh/authorized_keys`
   * file automatically when deploying from an Image.
   */
  authorized_users?: null | string[];
  /**
   * A Backup ID from another Linode’s available backups.
   *
   * Your User must have read_write access to that Linode,
   * the Backup must have a status of successful,
   * and the Linode must be deployed to the same region as the Backup.
   *
   * This field and the image field are mutually exclusive.
   */
  backup_id?: null | number;
  /**
   * If this field is set to true, the created Linode will automatically be enrolled in the Linode Backup service.
   * This will incur an additional charge. The cost for the Backup service is dependent on the Type of Linode deployed.
   *
   * This option is always treated as true if the account-wide backups_enabled setting is true.
   *
   * @default false
   */
  backups_enabled?: boolean | null;
  /**
   * If it is deployed from an Image or a Backup and you wish it to remain offline after deployment, set this to false.
   *
   * @default true if the Linode is created with an Image or from a Backup.
   * @default false if using new Linode Interfaces and no interfaces are defined
   */
  booted?: boolean | null;
  /**
   * A property with a string literal type indicating whether the Linode is encrypted or unencrypted.
   * @default 'enabled' (if the region supports LDE)
   */
  disk_encryption?: EncryptionStatus | null;
  /**
   * The `id` of the Firewall to attach this Linode to upon creation.
   */
  firewall_id?: null | number;
  /**
   * An Image ID to deploy the Linode Disk from.
   */
  image?: null | string;
  /**
   * When present, used by the API to determine what type of interface objects (legacy
   * config interfaces or new Linode Interfaces) are in the above interfaces field.
   * Can either be 'legacy_config' or 'linode'.
   *
   * If 'legacy_config', interfaces field must be type InterfacePayload[]
   * If 'linode', interfaces field must be type CreateLinodeInterfacePayload[] and Linode
   * must be created in a region that supports the new interfaces.
   *
   * Default value on depends on interfaces_for_new_linodes field in AccountSettings object.
   */
  interface_generation?: InterfaceGenerationType | null;
  /**
   * An array of Network Interfaces to add to this Linode’s Configuration Profile.
   */
  interfaces?: CreateLinodeInterfacePayload[] | InterfacePayload[];
  /**
   * An array of IPv4 addresses for this Linode
   * Must be empty if Linode is configured to use new Linode Interfaces.
   */
  ipv4?: string[];
  /**
   * The Linode’s label is for display purposes only.
   * If no label is provided for a Linode, a default will be assigned.
   */
  label?: null | string;
  /**
   * If true, the created Linode will have private networking enabled and assigned a private IPv4 address.
   * @default false
   */
  /**
   * Allows customers to specify which strategy this Linode should follow during
   * maintenance events.
   */
  maintenance_policy_id?: null | number;
  /**
   * An object containing user-defined data relevant to the creation of Linodes.
   */
  metadata?: null | UserData;
  /**
   * Default value mirrors network_helper in AccountSettings object. Should only be
   * present when using Linode Interfaces.
   */
  network_helper?: boolean;
  /**
   * An object that assigns this the Linode to a placement group upon creation.
   */
  placement_group?: CreateLinodePlacementGroupPayload | null;
  private_ip?: boolean | null;
  /**
   * The Region where the Linode will be located.
   */
  region: string;
  /**
   * This sets the root user’s password on a newly-created Linode Disk when deploying from an Image.
   */
  root_pass?: string;
  /**
   * This field is required only if the StackScript being deployed requires input data from the User for successful completion
   */
  stackscript_data?: any;
  /**
   * A StackScript ID that will cause the referenced StackScript to be run during deployment of this Linode.
   *
   * This field cannot be used when deploying from a Backup or a Private Image.
   */
  stackscript_id?: null | number;
  /**
   * When deploying from an Image, this field is optional, otherwise it is ignored.
   * This is used to set the swap disk size for the newly-created Linode.
   * @default 512
   */
  swap_size?: null | number;
  /**
   * An array of tags applied to this object.
   *
   * Tags are for organizational purposes only.
   */
  tags?: null | string[];
  /**
   * The Linode Type of the Linode you are creating.
   */
  type: string;
}

export interface MigrateLinodeRequest {
  placement_group?: {
    compliant_only?: boolean;
    id: number;
  };
  region: string;
}

export type RescueRequestObject = Pick<
  Devices,
  'sda' | 'sdb' | 'sdc' | 'sdd' | 'sde' | 'sdf' | 'sdg'
>;

export interface LinodeCloneData {
  backups_enabled?: boolean | null;
  configs?: number[];
  disks?: number[];
  label?: null | string;
  linode_id?: number;
  region?: null | string;
  tags?: null | string[];
  type?: null | string;
}

export type RebuildRequest = InferType<typeof RebuildLinodeSchema>;

export interface LinodeDiskCreationData {
  authorized_keys?: string[];
  authorized_users?: string[];
  filesystem?: 'ext3' | 'ext4' | 'initrd' | 'raw' | 'swap';
  image?: string;
  label: string;
  read_only?: boolean;
  root_pass?: string;
  size: number;
  stackscript_data?: any;
  stackscript_id?: number;
}

export type MigrationTypes = 'cold' | 'warm';

export interface ResizeLinodePayload {
  /** @default true */
  allow_auto_disk_resize?: boolean;
  /** @default 'cold' */
  migration_type?: MigrationTypes;
  type: string;
}

export interface DeleteInterfaceIds {
  configId: null | number;
  interfaceId: number;
  linodeId: number;
}

export interface LinodeLishData {
  glish_url: string;
  monitor_url: string;
  weblish_url: string;
  ws_protocols: string[];
}
