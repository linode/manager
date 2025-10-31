import { useRegionsQuery } from '@linode/queries';

import { DISALLOWED_IMAGE_REGIONS } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';

import type { Event, Image, Linode } from '@linode/api-v4';
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

export type ImagesVariant = 'custom' | 'recovery' | 'shared';

export interface ImagesSubTab {
  isBeta?: boolean;
  title: string;
  variant: ImagesVariant;
}

export const getImageLabelForLinode = (linode: Linode, images: Image[]) => {
  const image = images?.find((image) => image.id === linode.image);
  return image?.label ?? linode.image;
};

export const getEventsForImages = (images: Image[], events: Event[]) =>
  Object.fromEntries(
    images.map(({ id: imageId }) => [
      imageId,
      events.find(
        (thisEvent) =>
          `private/${thisEvent.secondary_entity?.id}` === imageId ||
          (`private/${thisEvent.entity?.id}` === imageId &&
            thisEvent.status === 'failed')
      ),
    ])
  );

/**
 * We don't have a nice region capability for Images
 * so we can use this useRegionsQuery wrapper to do
 * some filtering to get compatible regions.
 */
export const useRegionsThatSupportImageStorage = () => {
  const { data: regions } = useRegionsQuery();

  return {
    regions:
      regions?.filter(
        (r) =>
          r.capabilities.includes('Object Storage') &&
          !DISALLOWED_IMAGE_REGIONS.includes(r.id)
      ) ?? [],
  };
};

/**
 * Returns whether or not features related to the Private Image Sharing project
 * should be enabled.
 *
 * Currently, this just uses the `privateImageSharing` feature flag as a source of truth,
 * but will eventually also look at account capabilities.
 */

export const useIsPrivateImageSharingEnabled = () => {
  const flags = useFlags();

  // @TODO Private Image Sharing: check for customer tag/account capability when it exists
  return { isPrivateImageSharingEnabled: flags.privateImageSharing ?? false };
};

/**
 * Returns the index of the currently selected tab from an array of sub-tabs.
 *
 * @param subTabs - Array of sub-tabs with `variant` and `title` properties.
 * @param tab - The variant of currently selected tab. Currently, this value comes from 'subType' query param on the Images Landing Page.
 *
 * @returns the index of the selected tab
 */
export const getImagesSubTabIndex = (
  subTabs: ImagesSubTab[],
  selectedTab: ImagesVariant | undefined
) => {
  if (selectedTab === undefined) {
    return 0;
  }

  const tabIndex = subTabs.findIndex((tab) => tab.variant === selectedTab);

  if (tabIndex === -1) {
    return 0;
  }

  return tabIndex;
};

export const getImageTypeToSubType = (imageType: Image['type']) => {
  switch (imageType) {
    case 'automatic':
      return 'recovery';
    case 'manual':
      return 'custom';
    case 'shared':
      return 'shared';
  }
};
