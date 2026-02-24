import type { ImageLibrarySubTab } from '../../../utils';

export const imageLibrarySubTabs: ImageLibrarySubTab[] = [
  { type: 'owned-by-me', title: 'Owned by me' },
  {
    type: 'shared-with-me',
    title: 'Shared with me',
    isBeta: true,
  },
  { type: 'recovery-images', title: 'Recovery images' },
];
