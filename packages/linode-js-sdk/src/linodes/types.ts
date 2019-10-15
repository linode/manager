import { IPAddress, IPRange } from '../networking/types';
import { SSHKey } from '../profile/types';

export type Hypervisor = 'kvm' | 'zen';

export interface LinodeSpecs {
  disk: number;
  memory: number;
  vcpus: number;
  transfer: number;
  gpus: number;
}

export interface Linode {
  id: number;
  alerts: LinodeAlerts;
  backups: LinodeBackups;
  created: string;
  region: string;
  image: string | null;
  group: string;
  ipv4: string[];
  ipv6: string | null;
  label: string;
  type: null | string;
  status: LinodeStatus;
  updated: string;
  hypervisor: Hypervisor;
  specs: LinodeSpecs;
  watchdog_enabled: boolean;
  tags: string[];
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
}

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

export interface LinodeWithBackups extends Linode {
  currentBackups: LinodeBackupsResponse;
}

export interface LinodeBackupDisk {
  size: number;
  label: string;
  filesystem: string;
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
  /**
   * @todo Waiting on API to clarify as this is documented as an ENUM.
   */
  availability?: string;
}

export type LinodeBackupType = 'auto' | 'snapshot';

export type LinodeBackupStatus =
  | 'pending'
  | 'running'
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
  | 'restoring';

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
}

export interface DiskDevice {
  disk_id: null | number;
}
export interface VolumeDevice {
  volume_id: null | number;
}

export type Filesystem = 'raw' | 'swap' | 'ext3' | 'ext4' | 'initrd';

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

export interface Kernel {
  id: string;
  label: string;
  version: string;
  kvm: boolean;
  xen: boolean;
  architecture: string;
  pvops: boolean;
}

export type BootAction = 'reboot' | 'power_down' | null;

export type KebabAction = BootAction | 'delete';

interface NetStats {
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
  filesystem: DiskFilesystem;
  created: string;
  updated: string;
}

export type DiskStatus =
  | 'offline'
  | 'booting'
  | 'running'
  | 'shutting_down'
  | 'rebooting'
  | 'provisioning'
  | 'deleting'
  | 'migrating'
  | 'ready';

export type DiskFilesystem = 'raw' | 'swap' | 'ext3' | 'ext4' | 'initrd';

export interface LinodeConfigCreationData {
  label: string;
  devices: Devices;
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
}

export interface PriceObject {
  monthly: number;
  hourly: number;
}

export interface LinodeType {
  id: string;
  disk: number;
  class: LinodeTypeClass;
  price: PriceObject;
  successor: string | null;
  label: string;
  addons: {
    backups: { price: PriceObject };
  };
  network_out: number;
  memory: number;
  transfer: number;
  vcpus: number;
}

export type LinodeTypeClass =
  | 'nanode'
  | 'standard'
  | 'dedicated'
  | 'highmem'
  | 'gpu';

export interface IPAllocationRequest {
  type: 'ipv4';
  public: boolean;
}

export interface CreateLinodeRequest {
  type?: string;
  region?: string;
  stackscript_id?: number;
  backup_id?: number;
  swap_size?: number;
  image?: string;
  root_pass?: string;
  authorized_keys?: string[];
  backups_enabled?: boolean;
  stackscript_data?: any;
  booted?: boolean;
  label?: string;
  tags?: string[];
  private_ip?: boolean;
  authorized_users?: string[];
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
  authorized_keys?: SSHKey[];
  authorized_users?: string[];
  stackscript_id?: number;
  stackscript_data?: any;
  booted?: boolean;
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
