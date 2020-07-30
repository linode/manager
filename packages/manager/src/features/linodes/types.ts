export type DialogType = 'delete' | 'migrate' | 'resize';
export type OpenDialog = (
  type: DialogType,
  linodeID: number,
  linodeLabel?: string
) => void;
