namespace Linode {
  /* tslint:disable-next-line */
  export interface Linode {
    id: number;
    alerts: LinodeAlerts;
    backups: LinodeBackups;
    created: string;
    region: string;
    image: string | null;
    group: string;
    ipv4: string[];
    ipv6: string;
    label: string;
    type: null | string;
    status: LinodeStatus;
    updated: string;
    hypervisor: Hypervisor;
    specs: LinodeSpecs;
    watchdog_enabled: boolean;
    tags: string[];
    /** Added by UI */
    recentEvent?: Linode.Event;
    notifications?: Notification[];
    notification?: string;
    mostRecentBackup: string | null;
  }

  export interface LinodeAlerts {
    cpu: number;
    io: number;
    network_in: number;
    network_out: number;
    transfer_quota: number;
  }

  export interface LinodeBackups {
    enabled?: boolean;
    schedule: LinodeBackupSchedule;
    last_backup?: LinodeBackup;
    snapshot?: LinodeBackup;
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

  export interface IPAddress {
    address: string;
    gateway: string | null;
    subnet_mask: string;
    prefix: number;
    type: string;
    public: boolean;
    rdns: string | null;
    linode_id: number;
    region: string;
  }

  export interface IPRange {
    range: string;
    region: string;
    prefix?: number;
  }

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

  export type NotificationType =
    | 'migration_scheduled'
    | 'migration_pending'
    | 'reboot_scheduled'
    | 'outage'
    | 'maintenance'
    | 'payment_due'
    | 'ticket_important'
    | 'ticket_abuse'
    | 'notice'
    | 'promotion';

  export type NotificationSeverity = 'minor' | 'major' | 'critical';

  export interface Notification {
    entity: null | Entity;
    label: string;
    message: string;
    type: NotificationType;
    severity: NotificationSeverity;
    when: null | string;
    until: null | string;
    body: null | string;
  }

  export interface Entity {
    id: number;
    label: string;
    type: string;
    url: string;
  }

  export type EventAction =
    | 'account_update'
    | 'account_settings_update'
    | 'backups_cancel'
    | 'backups_enable'
    | 'backups_restore'
    | 'community_like'
    | 'community_question_reply'
    | 'credit_card_updated'
    | 'disk_create'
    | 'disk_update'
    | 'disk_delete'
    | 'disk_duplicate'
    | 'disk_imagize'
    | 'disk_resize'
    | 'domain_create'
    | 'domain_update'
    | 'domain_delete'
    | 'domain_record_create'
    | 'domain_record_updated'
    | 'domain_record_delete'
    | 'image_update'
    | 'image_delete'
    | 'linode_addip'
    | 'linode_boot'
    | 'linode_clone'
    | 'linode_create'
    | 'linode_update'
    | 'linode_delete'
    | 'linode_deleteip'
    | 'linode_migrate'
    | 'linode_reboot'
    | 'linode_resize'
    | 'linode_resize_create'
    | 'linode_migrate_datacenter_create'
    | 'linode_migrate_datacenter'
    | 'linode_mutate'
    | 'linode_mutate_create'
    | 'linode_rebuild'
    | 'linode_shutdown'
    | 'linode_snapshot'
    | 'linode_config_create'
    | 'linode_config_update'
    | 'linode_config_delete'
    | 'nodebalancer_config_create'
    | 'nodebalancer_config_update'
    | 'nodebalancer_config_delete'
    | 'nodebalancer_create'
    | 'nodebalancer_update'
    | 'nodebalancer_delete'
    | 'password_reset'
    | 'stackscript_create'
    | 'stackscript_update'
    | 'stackscript_delete'
    | 'stackscript_publicize'
    | 'stackscript_revise'
    | 'tfa_enabled'
    | 'tfa_disabled'
    | 'ticket_attachment_upload'
    | 'user_ssh_key_add'
    | 'user_ssh_key_update'
    | 'user_ssh_key_delete'
    | 'volume_create'
    | 'volume_update'
    | 'volume_delete'
    | 'volume_detach'
    | 'volume_attach'
    | 'volume_resize'
    | 'volume_clone';

  export type EventStatus =
    | 'scheduled'
    | 'started'
    | 'finished'
    | 'failed'
    | 'notification';

  export interface Event {
    id: number;
    action: EventAction;
    created: string;
    entity: Entity | null;
    percent_complete: number | null;
    rate: string | null;
    read: boolean;
    seen: boolean;
    status: EventStatus;
    time_remaining: null | number;
    username: string;
    _initial?: boolean;
  }
}
