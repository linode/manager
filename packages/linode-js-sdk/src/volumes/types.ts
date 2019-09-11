import { Event } from '../account/types';

export interface Volume {
  id: number;
  label: string;
  status: VolumeStatus;
  size: number;
  region: string;
  linode_id: null | number;
  created: string;
  updated: string;
  filesystem_path: string;
  recentEvent?: Event;
  tags: string[];
}

export type VolumeStatus =
  | 'creating'
  | 'active'
  | 'resizing'
  | 'deleting'
  | 'deleted'
  | 'contact_support';

export interface VolumeRequestPayload {
  label: string;
  size?: number;
  region?: string;
  linode_id?: number;
  config_id?: number;
  tags?: string[];
}

export interface AttachVolumePayload {
  linode_id: number;
  config_id?: number;
}
export interface CloneVolumePayload {
  label: string;
}

export interface ResizeVolumePayload {
  size: number;
}
