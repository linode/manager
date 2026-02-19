import type { ImageLibrarySubTab } from './utils';

export const imageLibrarySubTabs: ImageLibrarySubTab[] = [
  { type: 'owned', title: 'Owned by me' },
  {
    type: 'shared',
    title: 'Shared with me',
    isBeta: true,
  },
  { type: 'recovery', title: 'Recovery images' },
];
