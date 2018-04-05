namespace Linode {
  export interface Linode {
    id: string | number;
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
    devices: any;
  }
}
