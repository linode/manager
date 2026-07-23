import React from 'react';

import { Link } from 'src/components/Link';
import {
  SHARE_GROUPS_JOINED_TAB_PENDO_IDS,
  SHARE_GROUPS_MEMBERSHIP_REQUESTS_TAB_PENDO_IDS,
  SHARE_GROUPS_OWNED_TAB_PENDO_IDS,
} from 'src/features/Images/constants';

import { ACCESS_BILLING_INFO_LINK } from '../constants';
import { TABLE_CELL_BASE_STYLES } from './ShareGroupTable.styles';

import type { APIError } from '@linode/api-v4';
import type { HiddenProps } from '@linode/ui';
import type { ImageSubTab, ShareGroupsType } from 'src/features/Images/utils';

export interface ShareGroupsViewTableColConfig {
  /* Class name for this column */
  className?: string;

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
  {
    name: 'Group',
    sortableProps: { label: 'label' },
    className: 'group-column',
  },
  {
    name: 'Description',
    sortableProps: { label: 'description' },
    className: 'description-column',
  },
  {
    name: '# of members',
    className: 'membersCount-column',
  },
  {
    name: '# of images',
    hidden: 'smDown',
    className: 'imagesCount-column',
  },
  {
    name: 'Created',
    sortableProps: { label: 'created' },
    hidden: 'lgDown',
    className: 'created-column',
  },
  {
    name: 'Updated',
    sortableProps: { label: 'updated' },
    hidden: 'lgDown',
    className: 'updated-column',
  },
];

const JOINED_GROUPS_TABLE_COLUMNS: ShareGroupsViewTableColConfig[] = [
  {
    name: 'Group',
    sortableProps: { label: 'label' },
    className: 'group-column',
  },
  {
    name: 'Membership Status',
    sortableProps: { label: 'status' },
    className: 'membership-status-column',
  },
  {
    name: 'Status Changed',
    sortableProps: { label: 'updated' },
    hidden: 'mdDown',
    className: 'status-changed-column',
  },
];

const MEMBERSHIP_REQUESTS_TABLE_COLUMNS: ShareGroupsViewTableColConfig[] = [
  {
    name: 'Share Group UUID',
    sortableProps: { label: 'label' },
    hidden: 'smDown',
    style: { ...TABLE_CELL_BASE_STYLES, whiteSpace: 'nowrap', maxWidth: '35%' },
  },
  {
    name: 'Token UUID',
    sortableProps: { label: 'token_uuid' },
    style: { ...TABLE_CELL_BASE_STYLES, whiteSpace: 'nowrap', maxWidth: '35%' },
  },
  {
    name: 'Status',
    sortableProps: { label: 'status' },
    style: { ...TABLE_CELL_BASE_STYLES, whiteSpace: 'nowrap', maxWidth: '15%' },
  },
  {
    name: 'Created',
    sortableProps: { label: 'created' },
    hidden: 'lgDown',
    style: { ...TABLE_CELL_BASE_STYLES, maxWidth: '15%' },
  },
  {
    name: 'Expiry',
    sortableProps: { label: 'expiry' },
    hidden: 'mdDown',
    style: { ...TABLE_CELL_BASE_STYLES, maxWidth: '15%' },
  },
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
        instances from images shared within these groups. Shared images are free
        of charge, but instances deployed from shared images are billed on a
        regular basis. For details, see{' '}
        <Link to={ACCESS_BILLING_INFO_LINK}>Access billing information</Link>.
      </>
    ),
    docsLink: {
      href: 'https://techdocs.akamai.com/cloud-computing/docs/image-sharing',
      label: 'Image sharing',
      pendoId: SHARE_GROUPS_OWNED_TAB_PENDO_IDS.imageSharingDocsLink,
    },
    columns: OWNED_GROUPS_TABLE_COLUMNS,
    emptyMessage: {
      main: 'No share groups to display',
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
      pendoId: SHARE_GROUPS_OWNED_TAB_PENDO_IDS.createButton,
    },
    searchFieldPendoId: SHARE_GROUPS_OWNED_TAB_PENDO_IDS.searchShareGroupsBar,
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
    docsLink: {
      href: `https://techdocs.akamai.com/cloud-computing/docs/image-sharing`,
      label: 'Image sharing',
      pendoId: SHARE_GROUPS_JOINED_TAB_PENDO_IDS.imageSharingDocsLink,
    },
    emptyMessage: {
      main: 'No share groups to display',
      instruction:
        "Go to 'My membership requests' to make a request and join a group",
    },
    orderByDefault: 'label',
    orderDefault: 'asc',
    preferenceKey: 'joined-groups-table',
    searchFieldPendoId: SHARE_GROUPS_JOINED_TAB_PENDO_IDS.searchShareGroupsBar,
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
    docsLink: {
      href: 'https://techdocs.akamai.com/cloud-computing/docs/image-sharing',
      label: 'Image sharing',
      pendoId:
        SHARE_GROUPS_MEMBERSHIP_REQUESTS_TAB_PENDO_IDS.imageSharingDocsLink,
    },
    buttonProps: {
      buttonText: 'Request membership',
      navigateTo: '/images/share-groups/membership-requests/request',
      disabledToolTipText:
        'You do not have permissions to request share group memberships',
      pendoId:
        SHARE_GROUPS_MEMBERSHIP_REQUESTS_TAB_PENDO_IDS.requestMembershipButton,
    },
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
