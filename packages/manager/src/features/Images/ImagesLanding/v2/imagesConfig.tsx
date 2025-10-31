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
} from '../../constants';

import type { ImagesVariant, ImageViewTableColConfig } from '../../utils';
import type { Image } from '@linode/api-v4';

export interface ImageConfig {
  buttonProps?: {
    buttonText: string;
    disabledToolTipText?: string;
    navigateTo?: string;
  };
  columns: ImageViewTableColConfig[];
  description: React.ReactNode;
  docsLink?: string;
  emptyMessage: string;
  eventCategory: string;
  isEnabled: (subType: ImagesVariant | undefined) => boolean;
  orderByDefault: string;
  orderDefault: 'asc' | 'desc';
  preferenceKey: string;
  title: string;
  type: Image['type'];
}

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

const RECOVERY_IMAGES_TABLE_COLUMNS: ImageViewTableColConfig[] = [
  { header: 'Image', label: 'label', sortable: true },
  {
    header: 'Status',
    hiddenOn: 'smDown',
  },
  { header: 'Size', label: 'size', sortable: true },
  {
    header: 'Created',
    label: 'created',
    sortable: true,
    hiddenOn: 'smDown',
  },
  {
    header: 'Expires',
    hiddenOn: 'smDown',
  },
];

export const IMAGES_CONFIG: Omit<
  Record<ImagesVariant, ImageConfig>,
  'shared'
> = {
  custom: {
    title: 'My Custom Images',
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
    isEnabled: (subType) => subType === 'custom',
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
    emptyMessage: 'No Custom Images to display.',
  },
  recovery: {
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
    isEnabled: (subType) => subType === 'recovery',
    columns: RECOVERY_IMAGES_TABLE_COLUMNS,
    eventCategory: 'Recovery Images Table',
    emptyMessage: 'No Recovery Images to display.',
  },
  // "shared" images config will go here...
};
