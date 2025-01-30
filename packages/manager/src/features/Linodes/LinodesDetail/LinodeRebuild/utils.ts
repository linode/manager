export const REBUILD_OPTIONS = [
  { label: 'From Image' },
  { label: 'From Community StackScript' },
  { label: 'From Account StackScript' },
] as const;

export type LinodeRebuildType = typeof REBUILD_OPTIONS[number]['label'];
