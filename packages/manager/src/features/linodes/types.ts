export type DialogType = 'delete' | 'migrate' | 'resize' | 'rescue' | 'rebuild';
export type OpenDialog = (
  type: DialogType,
  linodeID: number,
  linodeLabel?: string
) => void;
