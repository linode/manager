import type { Region, RegionSite } from '../regions';
import type { IPAddress, IPRange } from '../networking/types';
import type { SSHKey } from '../profile/types';
import type { LinodePlacementGroupPayload } from '../placement-groups/types';

export type Hypervisor = 'kvm' | 'zen';

export type EncryptionStatus = 'enabled' | 'disabled';

export interface LinodeSpecs {
  disk: number;
  memory: number;
  vcpus: number;
  transfer: number;
  gpus: number;
  accelerated_devices: number;
}

export interface Linode {
  id: number;
  alerts: LinodeAlerts;
  backups: LinodeBackups;
  capabilities: LinodeCapabilities[];
  created: string;
  disk_encryption?: EncryptionStatus; // @TODO LDE: Remove optionality once LDE is fully rolled out
  region: string;
  image: string | null;
  group: string;
  ipv4: string[];
  ipv6: string | null;
  label: string;
  lke_cluster_id: number | null;
  placement_group?: LinodePlacementGroupPayload; // If not in a placement group, this will be excluded from the response.
  type: string | null;
  status: LinodeStatus;
  updated: string;
  hypervisor: Hypervisor;
  specs: LinodeSpecs;
  watchdog_enabled: boolean;
  tags: string[];
  site_type: RegionSite;
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
  schedule: LinodeBackupSchedule;
  last_successful: string | null;
}

export type LinodeCapabilities =
  | 'Block Storage Encryption'
  | 'SMTP Enabled'
  | 'Block Storage Performance B1';

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
  | 'Scheduling'
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export interface LinodeBackupSchedule {
  window: Window | null;
  day: Day | null;
}

export interface LinodeBackupsResponse {
  automatic: LinodeBackup[];
  snapshot: {
    current: LinodeBackup | null;
    in_progress: LinodeBackup | null;
  };
}

export type Filesystem = 'raw' | 'swap' | 'ext4' | 'ext3' | 'initrd';

export interface LinodeBackupDisk {
  size: number;
  label: string;
  filesystem: Filesystem;
}

export interface LinodeBackup {
  id: number;
  label: string | null;
  status: LinodeBackupStatus;
  type: LinodeBackupType;
  region: string;
  created: string;
  updated: string;
  finished: string;
  configs: string[];
  disks: LinodeBackupDisk[];
  available: boolean;
}

export type LinodeBackupType = 'auto' | 'snapshot';

export type LinodeBackupStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'needsPostProcessing'
  | 'successful'
  | 'failed'
  | 'userAborted';

export interface LinodeIPsResponse {
  ipv4: LinodeIPsResponseIPV4;
  ipv6?: LinodeIPsResponseIPV6;
}

export interface LinodeIPsResponseIPV4 {
  public: IPAddress[];
  private: IPAddress[];
  shared: IPAddress[];
  reserved: IPAddress[];
}

export interface LinodeIPsResponseIPV6 {
  link_local: IPAddress;
  slaac: IPAddress;
  global: IPRange[];
}

export type LinodeStatus =
  | 'offline'
  | 'booting'
  | 'running'
  | 'shutting_down'
  | 'rebooting'
  | 'rebuilding'
  | 'provisioning'
  | 'deleting'
  | 'migrating'
  | 'cloning'
  | 'restoring'
  | 'stopped';

// ---------------------------------------------------------------------
// Types relating to legacy interfaces (Configuration profile Interfaces)
// ----------------------------------------------------------------------
export type InterfacePurpose = 'public' | 'vlan' | 'vpc';

export interface ConfigInterfaceIPv4 {
  vpc?: string | null;
  nat_1_1?: string | null;
}

export interface ConfigInterfaceIPv6 {
  vpc?: string | null;
}

// The legacy interface type - for Configuration Profile Interfaces
export interface Interface {
  id: number;
  label: string | null;
  purpose: InterfacePurpose;
  ipam_address: string | null;
  primary?: boolean;
  active: boolean;
  subnet_id?: number | null;
  vpc_id?: number | null;
  ipv4?: ConfigInterfaceIPv4;
  ipv6?: ConfigInterfaceIPv6;
  ip_ranges?: string[];
}

export type InterfacePayload = Omit<Interface, 'id' | 'active'>;

export interface ConfigInterfaceOrderPayload {
  ids: number[];
}

export type UpdateConfigInterfacePayload = Pick<
  Interface,
  'primary' | 'ipv4' | 'ipv6' | 'ip_ranges'
>;

export interface Config {
  id: number;
  kernel: string;
  comments: string;
  memory_limit: number;
  root_device: string;
  run_level: 'default' | 'single' | 'binbash';
  virt_mode: 'paravirt' | 'fullvirt';
  helpers: any;
  label: string;
  devices: Devices;
  created: string;
  updated: string;
  initrd: string | null;
  interfaces: Interface[];
}

// ----------------------------------------------------------
// Types relating to new interfaces - Linode Interfaces
// ----------------------------------------------------------

export interface DefaultRoute {
  ipv4?: boolean;
  ipv6?: boolean;
}

// POST related types
export interface BaseIPv4InterfaceAddressPayload {
  address: string;
  primary?: boolean;
}

export interface VPCIpv4InterfaceAddress
  extends BaseIPv4InterfaceAddressPayload {
  nat_1_1_address?: string | null;
}

export interface VPCInterfacePayload {
  subnet_id: number;
  ipv4?: {
    addresses?: VPCIpv4InterfaceAddress[];
    ranges?: {
      range: string;
    }[];
  } | null;
}

export interface PublicInterfaceRanges {
  range: string | null;
}

export interface PublicInterfacePayload {
  ipv4?: {
    addresses?: BaseIPv4InterfaceAddressPayload[];
  };
  ipv6?: {
    ranges?: PublicInterfaceRanges[];
  };
}

// POST object
export interface CreateLinodeInterfacePayload {
  firewall_id?: number | null;
  default_route?: DefaultRoute | null;
  vpc?: VPCInterfacePayload | null;
  public?: PublicInterfacePayload | null;
  vlan?: {
    vlan_label: string;
    ipam_address?: string;
  } | null;
}

// PUT object -- TODO many extra null options? see if we can just align it more with the create payload (or vice versa)
// note - commenting the extra nulls here vs the create payload...extra null defaults prevent me from easily
// using the types I defined above (little overlap)
// they're allowing us to both omit or set to null. maybe we just define it without the nulls
// on our end, and purposely omit when we set these values in later forms?
export interface ModifyLinodeInterfacePayload {
  default_route?: {
    ipv4?: boolean | null; // extra null
    ipv6?: boolean | null; // extra null
  };
  vpc?: {
    subnet_id: number;
    ipv4?: {
      addresses?:
        | {
            address?: string;
            primary?: boolean | null; // extra null
            nat_1_1_address?: string | null;
          }[]
        | null; // extra null
      ranges?: { range: string }[] | null; // extra null
    } | null;
  } | null;
  public?: {
    ipv4?: {
      addresses?:
        | {
            address: string;
            primary?: boolean;
          }[]
        | null; // extra null
    } | null; // extra null
    ipv6?: {
      ranges: PublicInterfaceRanges[] | null; // extra null
    } | null; // extra null
  } | null;
  vlan?: {
    vlan_label: string;
    ipam_address?: string | null; // extra null
  } | null;
}

// GET related types
export interface VPCInterfaceData {
  vpc_id: number;
  subnet_id: number;
  ipv4: {
    addresses: {
      address: string;
      primary: boolean;
      nat_1_1_address?: string;
    }[];
    ranges: {
      range: string;
    }[];
  };
}

export interface PublicInterfaceData {
  ipv4: {
    addresses: {
      address: string;
      primary: boolean;
    }[];
  };
  ipv6: {
    addresses: {
      address: string;
      prefix: string;
    }[];
    ranges: {
      range: string;
      route_target: string;
    }[];
  };
}

// data returned from GET
export interface LinodeInterface {
  id: number;
  mac_address: string;
  default_route: DefaultRoute;
  version: number;
  created: string;
  updated: string;
  vpc: VPCInterfaceData | null;
  public: PublicInterfaceData | null;
  vlan: {
    vlan_label: string;
    ipam_address: string;
  } | null;
}

export interface LinodeInterfaces {
  interfaces: LinodeInterface[];
}

export type LinodeInterfaceStatus = 'active' | 'inactive' | 'deleted';

export interface LinodeInterfaceHistory {
  interface_history_id: number;
  interface_id: number;
  linode_id: number;
  event_id: number;
  version: number;
  interface_data: string; // must parse? (? ask clarification)
  status: LinodeInterfaceStatus;
  created: string;
}

export interface LinodeInterfaceSetting {
  network_helper: boolean;
  default_route: {
    ipv4_interface_id?: number | null;
    ipv4_eligible_interface_ids: number[];
    ipv6_interface_id?: number | null;
    ipv6_eligible_interface_ids: number[];
  };
}

export interface LinodeInterfaceSettingPayload {
  network_helper?: boolean | null;
  default_route: {
    ipv4_interface_id?: number | null;
    ipv6_interface_id?: number | null;
  };
}

export interface UpgradeInterfacePayload { 
  config_id?: number | null;
  dry_run?: boolean;
}

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
  sda: null | DiskDevice | VolumeDevice;
  sdb: null | DiskDevice | VolumeDevice;
  sdc: null | DiskDevice | VolumeDevice;
  sdd: null | DiskDevice | VolumeDevice;
  sde: null | DiskDevice | VolumeDevice;
  sdf: null | DiskDevice | VolumeDevice;
  sdg: null | DiskDevice | VolumeDevice;
  sdh: null | DiskDevice | VolumeDevice;
}

export type KernelArchitecture = 'x86_64' | 'i386';

export interface Kernel {
  id: string;
  label: string;
  version: string;
  kvm: boolean;
  architecture: KernelArchitecture;
  pvops: boolean;
  deprecated: boolean;
  /**
   * @example 2009-10-26T04:00:00
   */
  built: string;
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
  title: string;
  data: StatsData;
}

export interface Disk {
  id: number;
  label: string;
  status: DiskStatus;
  size: number;
  filesystem: Filesystem;
  created: string;
  updated: string;
  disk_encryption?: EncryptionStatus; // @TODO LDE: remove optionality once LDE is fully rolled out
}

export type DiskStatus = 'ready' | 'not ready' | 'deleting';

export interface LinodeConfigCreationData {
  label: string;
  devices: Devices;
  initrd: string | number | null;
  kernel?: string;
  comments?: string;
  memory_limit?: number;
  run_level?: 'default' | 'single' | 'binbash';
  virt_mode?: 'fullvirt' | 'paravirt';
  helpers: {
    updatedb_disabled: boolean;
    distro: boolean;
    modules_dep: boolean;
    network: boolean;
    devtmpfs_automount: boolean;
  };
  root_device: string;
  interfaces?: InterfacePayload[];
}

export interface PriceObject {
  monthly: number | null;
  hourly: number | null;
}

export interface RegionPriceObject extends PriceObject {
  id: Region['id'];
}

export interface BaseType {
  id: string;
  label: string;
  disk: number;
  memory: number;
  vcpus: number;
}
export interface LinodeType extends BaseType {
  transfer: number;
  class: LinodeTypeClass;
  successor: string | null;
  network_out: number;
  gpus: number;
  accelerated_devices: number;
  price: PriceObject;
  region_prices: RegionPriceObject[];
  addons: {
    backups: { price: PriceObject; region_prices: RegionPriceObject[] };
  };
}

export type LinodeTypeClass =
  | 'accelerated'
  | 'nanode'
  | 'standard'
  | 'dedicated'
  | 'highmem'
  | 'gpu'
  | 'metal'
  | 'prodedicated'
  | 'premium';

export interface IPAllocationRequest {
  type: 'ipv4';
  public: boolean;
}

export interface UserData {
  user_data: string | null;
}

export interface CreateLinodePlacementGroupPayload {
  id: number;
  /**
   * This parameter is silent in Cloud Manager, but still needs to be represented in the API types.
   *
   * @default false
   */
  compliant_only?: boolean;
}

export interface CreateLinodeRequest {
  /**
   * The Linode Type of the Linode you are creating.
   */
  type: string;
  /**
   * The Region where the Linode will be located.
   */
  region: string;
  /**
   * A StackScript ID that will cause the referenced StackScript to be run during deployment of this Linode.
   *
   * This field cannot be used when deploying from a Backup or a Private Image.
   */
  stackscript_id?: number | null;
  /**
   * A Backup ID from another Linode’s available backups.
   *
   * Your User must have read_write access to that Linode,
   * the Backup must have a status of successful,
   * and the Linode must be deployed to the same region as the Backup.
   *
   * This field and the image field are mutually exclusive.
   */
  backup_id?: number | null;
  /**
   * When deploying from an Image, this field is optional, otherwise it is ignored.
   * This is used to set the swap disk size for the newly-created Linode.
   * @default 512
   */
  swap_size?: number;
  /**
   * An Image ID to deploy the Linode Disk from.
   */
  image?: string | null;
  /**
   * This sets the root user’s password on a newly-created Linode Disk when deploying from an Image.
   */
  root_pass?: string;
  /**
   * A list of public SSH keys that will be automatically appended to the root user’s
   * `~/.ssh/authorized_keys`file when deploying from an Image.
   */
  authorized_keys?: string[];
  /**
   * If this field is set to true, the created Linode will automatically be enrolled in the Linode Backup service.
   * This will incur an additional charge. The cost for the Backup service is dependent on the Type of Linode deployed.
   *
   * This option is always treated as true if the account-wide backups_enabled setting is true.
   *
   * @default false
   */
  backups_enabled?: boolean;
  /**
   * This field is required only if the StackScript being deployed requires input data from the User for successful completion
   */
  stackscript_data?: any;
  /**
   * If it is deployed from an Image or a Backup and you wish it to remain offline after deployment, set this to false.
   * @default true if the Linode is created with an Image or from a Backup.
   */
  booted?: boolean;
  /**
   * The Linode’s label is for display purposes only.
   * If no label is provided for a Linode, a default will be assigned.
   */
  label?: string;
  /**
   * An array of tags applied to this object.
   *
   * Tags are for organizational purposes only.
   */
  tags?: string[];
  /**
   * If true, the created Linode will have private networking enabled and assigned a private IPv4 address.
   * @default false
   */
  private_ip?: boolean;
  /**
   * A list of usernames. If the usernames have associated SSH keys,
   * the keys will be appended to the root users `~/.ssh/authorized_keys`
   * file automatically when deploying from an Image.
   */
  authorized_users?: string[];
  /**
   * An array of Network Interfaces to add to this Linode’s Configuration Profile.
   */
  interfaces?: InterfacePayload[];
  /**
   * An object containing user-defined data relevant to the creation of Linodes.
   */
  metadata?: UserData;
  /**
   * The `id` of the Firewall to attach this Linode to upon creation.
   */
  firewall_id?: number | null;
  /**
   * An object that assigns this the Linode to a placement group upon creation.
   */
  placement_group?: CreateLinodePlacementGroupPayload;
  /**
   * A property with a string literal type indicating whether the Linode is encrypted or unencrypted.
   * @default 'enabled' (if the region supports LDE)
   */
  disk_encryption?: EncryptionStatus;
}

export interface MigrateLinodeRequest {
  placement_group?: {
    id: number;
    compliant_only?: boolean;
  };
  region: string;
}

export type RescueRequestObject = Pick<
  Devices,
  'sda' | 'sdb' | 'sdc' | 'sdd' | 'sde' | 'sdf' | 'sdg'
>;

export interface LinodeCloneData {
  linode_id?: number;
  region?: string | null;
  type?: string | null;
  label?: string | null;
  backups_enabled?: boolean | null;
  tags?: string[] | null;
  configs?: number[];
  disks?: number[];
}

export interface RebuildRequest {
  image: string;
  root_pass: string;
  metadata?: UserData;
  authorized_keys?: SSHKey[];
  authorized_users?: string[];
  stackscript_id?: number;
  stackscript_data?: any;
  booted?: boolean;
  disk_encryption?: EncryptionStatus;
}

export interface LinodeDiskCreationData {
  label: string;
  size: number;
  filesystem?: 'raw' | 'swap' | 'ext3' | 'ext4' | 'initrd';
  read_only?: boolean;
  image?: string;
  authorized_keys?: string[];
  authorized_users?: string[];
  root_pass?: string;
  stackscript_id?: number;
  stackscript_data?: any;
}

export type MigrationTypes = 'warm' | 'cold';

export interface ResizeLinodePayload {
  type: string;
  /** @default true */
  allow_auto_disk_resize?: boolean;
  /** @default 'cold' */
  migration_type?: MigrationTypes;
}

export interface DeleteLinodeConfigInterfacePayload {
  linodeId: number;
  configId: number;
  interfaceId: number;
}

export interface LinodeLishData {
  weblish_url: string;
  glish_url: string;
  monitor_url: string;
  ws_protocols: string[];
}
