import React from 'react';

import type { APIError } from '@linode/api-v4';
import type { HiddenProps } from '@linode/ui';
import type { ImageSubTab, ShareGroupsType } from 'src/features/Images/utils';

export interface ShareGroupsViewTableColConfig {
  /* Breakpoint to hide the column (e.g., 'smDown', 'mdUp', etc) */
  hidden?: Exclude<keyof HiddenProps, 'children'>;

  /* Column name */
  name: string;

  /* Provide sortableProps to enable sorting for this column. */
  sortableProps?: {
    /* API field used for sorting this column */
    label: string;
  };
  /* Style overrides for this column */
  style?: React.CSSProperties;
}
export interface ShareGroupsTabsConfig {
  buttonProps?: {
    buttonText: string;
    disabledToolTipText?: string;
    navigateTo?: string;
    pendoId?: string;
  };
  columns: ShareGroupsViewTableColConfig[];
  description: React.ReactNode;
  docsLink?: { href: string; label?: string; pendoId?: string };
  emptyMessage: {
    instruction?: string;
    main: string;
  };
  error?: APIError[] | null;
  orderByDefault: string;
  orderDefault: 'asc' | 'desc';
  preferenceKey: string;
  searchFieldPendoId?: string;
  title: string;
}

export const shareGroupsSubTabs: ImageSubTab<ShareGroupsType>[] = [
  {
    type: 'owned-groups',
    title: 'Owned groups',
    pendoId: 'Images Owned-Groups tab',
  },
  {
    type: 'joined-groups',
    title: 'Joined groups',
    pendoId: 'Images Joined-Groups tab',
  },
  {
    type: 'membership-requests',
    title: 'My membership requests',
    pendoId: 'Images Membership-Requests tab',
  },
];

const OWNED_GROUPS_TABLE_COLUMNS: ShareGroupsViewTableColConfig[] = [
  { name: 'Group', sortableProps: { label: 'label' } },
  {
    name: 'Description',
    sortableProps: { label: 'description' },
  },
  {
    name: '# of members',
  },
  {
    name: '# of images',
    hidden: 'smDown',
  },
  {
    name: 'Created',
    sortableProps: { label: 'created' },
    hidden: 'lgDown',
    style: { whiteSpace: 'nowrap' },
  },
  {
    name: 'Updated',
    sortableProps: { label: 'updated' },
    hidden: 'lgDown',
    style: { whiteSpace: 'nowrap' },
  },
];

const JOINED_GROUPS_TABLE_COLUMNS: ShareGroupsViewTableColConfig[] = [
  { name: 'Group', sortableProps: { label: 'label' } },
  { name: 'Description', sortableProps: { label: 'description' } },
  { name: 'Membership Status', sortableProps: { label: 'membership_status' } },
  {
    name: 'Status Changed',
    sortableProps: { label: 'status_changed' },
    hidden: 'lgDown',
  },
];

const MEMBERSHIP_REQUESTS_TABLE_COLUMNS: ShareGroupsViewTableColConfig[] = [
  { name: 'Share Group UUID', sortableProps: { label: 'label' } },
  { name: 'Token UUID', sortableProps: { label: 'token_uuid' } },
  { name: 'Status', sortableProps: { label: 'status' } },
  { name: 'Created', sortableProps: { label: 'created' }, hidden: 'mdDown' },
  { name: 'Expiry', sortableProps: { label: 'expiry' }, hidden: 'mdDown' },
];

export const SHAREGROUPS_CONFIG: Record<
  ShareGroupsType,
  ShareGroupsTabsConfig
> = {
  'owned-groups': {
    title: 'Owned groups',
    description: (
      <>
        These are share groups you own. Other group members can deploy compute
        instances from images shared within these groups.
        <br />
        Shared images are not additionally billed on top of existing original
        and replicated images.
      </>
    ),
    docsLink: {
      href: `https://techdocs.akamai.com/cloud-computing/docs/image-sharing`,
      label: 'Image sharing',
      pendoId: 'Images Groups Owned-Docs',
    },
    columns: OWNED_GROUPS_TABLE_COLUMNS,
    emptyMessage: {
      main: 'No Share groups to display',
      instruction:
        'Click \u2018Create Share Group\u2019 to create your first share group and share your custom images with other accounts.',
    },
    orderByDefault: 'label',
    orderDefault: 'asc',
    preferenceKey: 'owned-groups-table',
    buttonProps: {
      buttonText: 'Create Share Group',
      navigateTo: '/images/share-groups/create',
      disabledToolTipText: 'You do not have permissions to create share groups',
      pendoId: 'Images Groups Owned-Create Button',
    },
    searchFieldPendoId: 'Images Groups Owned-Search',
  },
  'joined-groups': {
    title: 'Joined groups',
    description: (
      <>
        Manage your share group memberships. Groups you leave or are revoked
        from will be removed from this list after one month.
      </>
    ),
    columns: JOINED_GROUPS_TABLE_COLUMNS,
    emptyMessage: {
      main: 'No share groups to display',
      instruction:
        "Go to 'My membership requests' to make a request and join a group",
    },
    orderByDefault: 'label',
    orderDefault: 'asc',
    preferenceKey: 'joined-groups-table',
  },
  'membership-requests': {
    title: 'Membership requests',
    description: (
      <>
        Manage your membership and track your share group membership requests.
        We remove expired or cancelled requests after two weeks.
      </>
    ),
    columns: MEMBERSHIP_REQUESTS_TABLE_COLUMNS,
    emptyMessage: {
      main: 'No membership requests to display',
      instruction:
        "Click 'Request Membership' to create your first membership request",
    },
    orderByDefault: 'label',
    orderDefault: 'asc',
    preferenceKey: 'membership-requests-table',
  },
};
