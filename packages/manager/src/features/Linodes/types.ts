import type { BaseQueryParams, LinodeCreateType } from '@linode/utilities';

export type DialogType =
  | 'delete'
  | 'detach_vlan'
  | 'enable_backups'
  | 'migrate'
  | 'rebuild'
  | 'rescue'
  | 'resize'
  | 'upgrade_volumes';

export interface LinodeCreateQueryParams extends BaseQueryParams {
  type: LinodeCreateType;
}

export interface LinodeConfigAndDiskQueryParams extends BaseQueryParams {
  selectedDisk: string;
  selectedLinode: string;
}

export type BooleanString = 'false' | 'true';
