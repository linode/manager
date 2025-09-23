export type VolumeEncryption = 'disabled' | 'enabled';

export interface Volume {
  created: string;
  /**
   * Indicates whether a volume is encrypted or not
   *
   * @TODO BSE: Remove optionality once BSE is fully rolled out
   */
  encryption?: VolumeEncryption; //
  filesystem_path: string;
  hardware_type: VolumeHardwareType;
  id: number;
  /**
   * Indicates whether a volume is ready for I/O operations
   *
   * @TODO Remove optionality once io_ready is fully rolled out
   */
  io_ready?: boolean;
  label: string;
  linode_id: null | number;
  linode_label: null | string;
  region: string;
  size: number;
  status: VolumeStatus;
  tags: string[];
  updated: string;
}

type VolumeHardwareType = 'hdd' | 'nvme';

export type VolumeStatus =
  | 'active'
  | 'creating'
  | 'key_rotating'
  | 'migrating'
  | 'offline'
  | 'resizing';

export interface VolumeRequestPayload {
  config_id?: number;
  encryption?: VolumeEncryption;
  label: string;
  linode_id?: number;
  region?: string;
  size?: number;
  tags?: string[];
}

export interface AttachVolumePayload {
  config_id?: number;
  linode_id: number;
}
export interface CloneVolumePayload {
  label: string;
}

export interface ResizeVolumePayload {
  size: number;
}

export interface VolumesMigrationQueue {
  linodes: number;
  volumes: number;
}

export interface MigrateVolumesPayload {
  volumes: number[];
}
