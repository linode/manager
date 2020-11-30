export type DialogType =
  | 'delete'
  | 'enable_backups'
  | 'migrate'
  | 'resize'
  | 'rescue'
  | 'rebuild'
  | 'detach_vlan';
export type OpenDialog = (
  type: DialogType,
  linodeID: number,
  linodeLabel?: string
) => void;
