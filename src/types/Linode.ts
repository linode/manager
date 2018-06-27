namespace Linode {
  export interface Linode {
    id: number;
    alerts: LinodeAlerts;
    backups: LinodeBackups;
    created: string;
    region: string;
    image: string | null;
    group?: string;
    ipv4: string[];
    ipv6: string;
    label: string;
    type: null | string;
    status: LinodeStatus;
    updated: string;
    hypervisor: Hypervisor;
    specs: LinodeSpecs;
    watchdog_enabled: boolean;
    recentEvent?: Linode.Event;
  }

  export interface EnhancedLinode extends Linode.Linode {
    recentEvent?: Linode.Event;
    notification?: string;
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
    last_backup?: LinodeBackup;
    snapshot?: LinodeBackup;
  }

  export interface LinodeBackupSchedule {
    window: string;
    day: string;
  }

  export interface LinodeBackupsResponse {
    automatic: LinodeBackup[];
    snapshot: {
      current: LinodeBackup | null,
      in_progress: LinodeBackup | null,
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
    'pending'
    | 'running'
    | 'needsPostProcessing'
    | 'successful'
    | 'failed'
    | 'userAborted';

  export interface IPAddress {
    address: string;
    gateway: string;
    subnet_mask: string;
    prefix: number;
    type: string;
    public: boolean;
    rdns: string;
    linode_id: number;
    region: string;
  }

  export interface IPRange {
    range: string;
    region: string;
    prefix?: number;
  }

  export interface LinodeIPsResponse {
    ipv4: {
      public: IPAddress[];
      private: IPAddress[];
      shared: IPAddress[];
    };
    ipv6: {
      link_local: IPAddress;
      slaac: IPAddress;
      global: IPRange[];
    };
  }

  export type LinodeStatus =
    'offline'
    | 'booting'
    | 'running'
    | 'shutting_down'
    | 'rebooting'
    | 'provisioning'
    | 'deleting'
    | 'migrating';

  export interface Config {
    id: number;
    kernel: string;
    comments: string;
    memory_limit: number;
    root_device_ro: boolean;
    root_device: string;
    run_level: 'default' | 'single' | 'binbash';
    virt_mode: 'paravirt' | 'fullvirt';
    helpers: any;
    label: any;
    devices: Devices;
  }

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
    [index: string]: null | DiskDevice | VolumeDevice;
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

}
