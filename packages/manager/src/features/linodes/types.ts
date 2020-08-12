export type DialogType =
  | 'delete'
  | 'enable_backups'
  | 'migrate'
  | 'resize'
  | 'rescue';
export type OpenDialog = (
  type: DialogType,
  linodeID: number,
  linodeLabel?: string
) => void;
