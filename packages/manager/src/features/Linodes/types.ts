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
