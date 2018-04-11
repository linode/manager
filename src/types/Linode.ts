namespace Linode {
  export interface Linode {
    id: number;
    alerts: LinodeAlerts;
    backups: LinodeBackups;
    created: string;
    region: string;
    image: string;
    group?: string;
    ipv4: string[];
    ipv6: string;
    label: string;
    type: string;
    status: LinodeStatus;
    updated: string;
    hypervisor: Hypervisor;
    specs: LinodeSpecs;
  }

  export interface EnhancedLinode extends Linode.Linode {
    recentEvent?: Linode.Event;
    notification?: string;
  }

  interface LinodeAlerts {
    cpu: number;
    io: number;
    network_in: number;
    network_out: number;
    transfer_quota: number;
  }

  interface LinodeBackups {
    enabled: boolean;
    schedule: LinodeBackupSchedule;
    last_backup?: LinodeBackup;
    snapshot?: LinodeBackup;
  }

  interface LinodeBackupSchedule {
    window: string;
    day: string;
  }

  interface LinodeBackup {
    id: number;
    label: string;
    status: LinodeBackupStatus;
    type: LinodeBackupType;
    region: string;
    created: string;
    updated: string;
    finished: string;
    configs: string[];
    disks: Disk[];
    /**
     * @todo Waiting on API to clarify as this is documented as an ENUM.
     */
    availability: string;
  }

  type LinodeBackupType = 'auto' | 'snapshot';

  type LinodeBackupStatus =
    'pending'
    | 'running'
    | 'needsPostProcessing'
    | 'successful'
    | 'failed'
    | 'userAborted';


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
    run_level: 'default' | 'single' | 'binbash';
    virt_mode: 'paravirt' | 'fullvirt';
    helpers: any;
    label: any;
    devices: ConfigDevices;
  }

  export interface ConfigDevices {
    sda: null | ConfigDevice;
    sdb: null | ConfigDevice;
    sdc: null | ConfigDevice;
    sdd: null | ConfigDevice;
    sde: null | ConfigDevice;
    sdf: null | ConfigDevice;
    sdg: null | ConfigDevice;
    sdh: null | ConfigDevice;
  }

  interface ConfigDevice {
    /* disk_id and volume_id are mutually exclusive. */
    disk_id: null | number;
    volume_id: null | number;
  }
}
