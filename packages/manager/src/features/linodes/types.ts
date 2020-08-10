export type DialogType = 'delete' | 'migrate' | 'resize' | 'rescue';
export type OpenDialog = (
  type: DialogType,
  linodeID: number,
  linodeLabel?: string
) => void;
