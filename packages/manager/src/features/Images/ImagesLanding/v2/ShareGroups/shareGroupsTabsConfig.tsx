import type { ImageSubTab, ShareGroupsType } from 'src/features/Images/utils';

export const shareGroupsSubTabs: ImageSubTab<ShareGroupsType>[] = [
  {
    type: 'owned-groups',
    title: 'Owned groups',
  },
  {
    type: 'joined-groups',
    title: 'Joined groups',
  },
  {
    type: 'membership-requests',
    title: 'My membership requests',
  },
];
