/**
 * Necessary for ES6 import of svg/png files, else we would have to require() them.
 *
 * @see https://github.com/Microsoft/TypeScript-React-Starter/issues/12#issuecomment-326370098
 */
declare module '*.svg';
declare module '*.png';

type TodoAny = any;

/******************************************************************************
 * Linodes
******************************************************************************/
interface Linode {
  id: string|number;
  alerts: LinodeAlerts;
  backups: LinodeBackups;
  created: string;
  region: string;
  image: string;
  group: string;
  ipv4: string[];
  ipv6: string;
  label: string;
  type: string;
  status: LinodeStatus;
  updated: string;
  hypervisor: Hypervisor;
  specs: LinodeSpecs;
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
  disks: LinodeDisk[];
  /**
   * @todo Waiting on API to clarify as this is documented as an ENUM.
   */
  availability: string;
}

type LinodeBackupType = 'auto' | 'snapshot';

type LinodeBackupStatus = 'pending'
  | 'running'
  | 'needsPostProcessing'
  | 'successful'
  | 'failed'
  | 'userAborted';


type LinodeStatus = 'offline'
  | 'booting'
  | 'running'
  | 'shutting_down'
  | 'rebooting'
  | 'provisioning'
  | 'deleting'
  | 'migrating';

interface LinodeDisk {
  id: number;
  label: string;
  status: LinodeBackupDiskStatus;
  size: number;
  filesystem: LinodeBackupDiskFilesystem;
  created: string;
  updated: string;
}
type LinodeBackupDiskStatus = 'offline'
  | 'booting'
  | 'running'
  | 'shutting_down'
  | 'rebooting'
  | 'provisioning'
  | 'deleting'
  | 'migrating';

type LinodeBackupDiskFilesystem = 'raw'
  | 'swap'
  | 'ext3'
  | 'ext4'
  | 'initrd';

type Hypervisor = 'kvm' | 'zen';

interface LinodeSpecs {
  disk: number;
  memory: number;
  vcpus: number;
  transfer: number;
}

/**
 * Linode Types
 */
interface LinodeType {
  id: string;
  disk: number;
  class: LinodeClass;
  price: PriceObject;
  label: string;
  addons: {
    backups: { price: PriceObject};
  };
  network_out: number;
  memory: number;
  transfer: number;
  vcpus: number;
}

type LinodeClass = 'nanode' | 'standard' | 'highmem';

interface PriceObject {
  monthly: number;
  hourly: number;
}

/**
 * Images
 */
interface Image {
  id: string;
  label: string;
  description: string|null;
  created: string;
  type: 'manual' | 'automatic';
  is_public: Boolean;
  size: number;
  created_by: string;
  vendor: string;
  deprecated: Boolean;
}

type ImageType = 'manual' | 'automatic';
