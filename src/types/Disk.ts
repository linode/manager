namespace Linode {
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
}
