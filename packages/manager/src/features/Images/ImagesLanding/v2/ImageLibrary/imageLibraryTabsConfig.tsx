import * as React from 'react';

import { Link } from 'src/components/Link';
import { getRestrictedResourceText } from 'src/features/Account/utils';

import {
  AUTOMATIC_IMAGES_DEFAULT_ORDER,
  AUTOMATIC_IMAGES_DEFAULT_ORDER_BY,
  AUTOMATIC_IMAGES_PREFERENCE_KEY,
  MANUAL_IMAGES_DEFAULT_ORDER,
  MANUAL_IMAGES_DEFAULT_ORDER_BY,
  MANUAL_IMAGES_PREFERENCE_KEY,
} from '../../../constants';

import type { ImageLibrarySubTab, ImageLibraryType } from '../../../utils';
import type { Image } from '@linode/api-v4';
import type { HiddenProps } from '@linode/ui';

export interface ImageViewTableColConfig {
  /** Breakpoint to hide the column (e.g., 'smDown', 'mdUp', etc) */
  hiddenOn?: Exclude<keyof HiddenProps, 'children'>;

  /** Field name for sorting (required if sortable is `true`) */
  label?: string;

  /** Column name */
  name: React.ReactNode | string;

  /** Enable sorting for this column */
  sortable?: boolean;
}

export interface ImageConfig {
  buttonProps?: {
    buttonText: string;
    disabledToolTipText?: string;
    navigateTo?: string;
  };
  columns: ImageViewTableColConfig[];
  description: React.ReactNode;
  docsLink?: { href: string; label?: string };
  emptyMessage: {
    instruction?: string;
    main: string;
  };
  eventCategory: string;
  isEnabled: (subType: ImageLibraryType | undefined) => boolean;
  orderByDefault: string;
  orderDefault: 'asc' | 'desc';
  preferenceKey: string;
  title: string;
  type: Image['type'];
}

export const imageLibrarySubTabs: ImageLibrarySubTab[] = [
  { type: 'owned-by-me', title: 'Owned by me' },
  {
    type: 'shared-with-me',
    title: 'Shared with me',
    isBeta: true,
  },
  { type: 'recovery-images', title: 'Recovery images' },
];

const CUSTOM_IMAGES_TABLE_COLUMNS: ImageViewTableColConfig[] = [
  { name: 'Image', label: 'label', sortable: true },
  {
    name: 'Status',
    hiddenOn: 'smDown',
  },
  {
    name: 'Replicated in',
    hiddenOn: 'smDown',
  },
  { name: 'Original Image', label: 'size', sortable: true },
  {
    name: 'All Replicas',
    hiddenOn: 'mdDown',
  },
  {
    name: 'Created',
    label: 'created',
    sortable: true,
    hiddenOn: 'mdDown',
  },
  {
    name: 'Image ID',
    hiddenOn: 'mdDown',
  },
];

const RECOVERY_IMAGES_TABLE_COLUMNS: ImageViewTableColConfig[] = [
  { name: 'Image', label: 'label', sortable: true },
  {
    name: 'Status',
    hiddenOn: 'smDown',
  },
  { name: 'Size', label: 'size', sortable: true },
  {
    name: 'Created',
    label: 'created',
    sortable: true,
    hiddenOn: 'smDown',
  },
  {
    name: 'Expires',
    hiddenOn: 'smDown',
  },
];

export const IMAGES_CONFIG: Omit<
  Record<ImageLibraryType, ImageConfig>,
  'shared-with-me'
> = {
  'owned-by-me': {
    title: 'Owned by me',
    description: (
      <>
        These are{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/capture-an-image#capture-an-image">
          encrypted
        </Link>{' '}
        images you manually uploaded or captured from an existing compute
        instance disk. You can deploy an image to a compute instance in any
        region. If you deploy the instance in a different region from where the
        image is stored, you may experience slower linode deployment times.
      </>
    ),
    type: 'manual',
    orderByDefault: MANUAL_IMAGES_DEFAULT_ORDER_BY,
    orderDefault: MANUAL_IMAGES_DEFAULT_ORDER,
    preferenceKey: MANUAL_IMAGES_PREFERENCE_KEY,
    isEnabled: (subType) => subType === 'owned-by-me',
    columns: CUSTOM_IMAGES_TABLE_COLUMNS,
    buttonProps: {
      buttonText: 'Create Image',
      navigateTo: '/images/create',
      disabledToolTipText: getRestrictedResourceText({
        action: 'create',
        isSingular: false,
        resourceType: 'Images',
      }),
    },
    eventCategory: 'Custom Images Table',
    emptyMessage: {
      main: 'No custom images to display',
      instruction:
        'Click \u2018Create Image\u2019 to create your first custom image',
    },
  },
  'recovery-images': {
    title: 'Recovery Images',
    description: (
      <>
        These are images we automatically capture when Linode disks are deleted.
        They will be deleted after the indicated expiration date.
      </>
    ),
    type: 'automatic',
    orderByDefault: AUTOMATIC_IMAGES_DEFAULT_ORDER_BY,
    orderDefault: AUTOMATIC_IMAGES_DEFAULT_ORDER,
    preferenceKey: AUTOMATIC_IMAGES_PREFERENCE_KEY,
    isEnabled: (subType) => subType === 'recovery-images',
    columns: RECOVERY_IMAGES_TABLE_COLUMNS,
    eventCategory: 'Recovery Images Table',
    emptyMessage: {
      main: 'No recovery images to display',
    },
    docsLink: {
      label: 'Recover a deleted Linode',
      href: 'https://techdocs.akamai.com/cloud-computing/docs/images#recover-a-deleted',
    },
  },
  // "shared-with-me" images config will go here
};
