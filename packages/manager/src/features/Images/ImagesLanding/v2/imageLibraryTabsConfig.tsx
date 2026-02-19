import * as React from 'react';

import { Link } from 'src/components/Link';
import { getRestrictedResourceText } from 'src/features/Account/utils';

import {
  MANUAL_IMAGES_DEFAULT_ORDER,
  MANUAL_IMAGES_DEFAULT_ORDER_BY,
  MANUAL_IMAGES_PREFERENCE_KEY,
} from '../../constants';

import type { ImageLibrarySubTab } from '../../utils';
import type { ImageLibraryType } from '../../utils';
import type { Image } from '@linode/api-v4';
import type { HiddenProps } from '@linode/ui';

export interface ImageViewTableColConfig {
  /** Column header */
  header: React.ReactNode | string;

  /** Breakpoint to hide the column (e.g., 'smDown', 'mdUp', etc) */
  hiddenOn?: Exclude<keyof HiddenProps, 'children'>;

  /** Field name for sorting (required if sortable is `true`) */
  label?: string;

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
  docsLink?: string;
  emptyMessage: {
    instruction: string;
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
  { type: 'owned', title: 'Owned by me' },
  {
    type: 'shared',
    title: 'Shared with me',
    isBeta: true,
  },
  { type: 'recovery', title: 'Recovery images' },
];

const CUSTOM_IMAGES_TABLE_COLUMNS: ImageViewTableColConfig[] = [
  { header: 'Image', label: 'label', sortable: true },
  {
    header: 'Status',
    hiddenOn: 'smDown',
  },
  {
    header: 'Replicated in',
    hiddenOn: 'smDown',
  },
  { header: 'Original Image', label: 'size', sortable: true },
  {
    header: 'All Replicas',
    hiddenOn: 'mdDown',
  },
  {
    header: 'Created',
    label: 'created',
    sortable: true,
    hiddenOn: 'mdDown',
  },
  {
    header: 'Image ID',
    hiddenOn: 'mdDown',
  },
];

export const IMAGES_CONFIG: Omit<
  Record<ImageLibraryType, ImageConfig>,
  'recovery' | 'shared'
> = {
  owned: {
    title: 'Owned by me',
    description: (
      <>
        These are{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/capture-an-image#capture-an-image">
          encrypted
        </Link>{' '}
        images you manually uploaded or captured from an existing compute
        instance disk.
      </>
    ),
    type: 'manual',
    orderByDefault: MANUAL_IMAGES_DEFAULT_ORDER_BY,
    orderDefault: MANUAL_IMAGES_DEFAULT_ORDER,
    preferenceKey: MANUAL_IMAGES_PREFERENCE_KEY,
    docsLink: 'https://techdocs.akamai.com/cloud-computing/docs/images',
    isEnabled: (subType) => subType === 'owned',
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
      main: 'No Custom Images to display.',
      instruction:
        'Click \u2018Create Image\u2019 to create your first custom image',
    },
  },
  // "shared", and 'recovery' images config will go here...
};
