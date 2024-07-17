import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';
import type { BaseQueryParams } from 'src/utilities/queryParams';

export type DialogType =
  | 'delete'
  | 'detach_vlan'
  | 'enable_backups'
  | 'migrate'
  | 'rebuild'
  | 'rescue'
  | 'resize'
  | 'upgrade_volumes';

export type OpenDialog = (
  type: DialogType,
  linodeID: number,
  linodeLabel?: string
) => void;

export interface LinodeCreateQueryParams extends BaseQueryParams {
  type: LinodeCreateType;
}

export interface LinodeConfigAndDiskQueryParams extends BaseQueryParams {
  selectedDisk: string;
  selectedLinode: string;
}

export type BooleanString = 'false' | 'true';
