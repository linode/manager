import { useRegionsQuery } from '@linode/queries';

import { DISALLOWED_IMAGE_REGIONS } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';

import type { Event, Image, Linode } from '@linode/api-v4';

export type ImageLibraryType = 'custom' | 'recovery' | 'shared';

/**
 * Configuration for image sub-tabs within the Image Library tab.
 */
export interface ImageLibrarySubTab {
  /** Whether this tab represents a beta feature */
  isBeta?: boolean;
  /** Display title for the tab */
  title: string;
  /** The type this tab represents */
  type: ImageLibraryType;
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
 * Returns the index of the currently selected sub-tab from an array of sub-tabs.
 *
 * @param subTabs - Array of sub-tabs with `type` and `title` properties.
 * @param selectedTab - The type of currently selected sub-tab. Currently, this value comes from 'type' query param on the Image Library tab.
 *
 * @returns the index of the selected sub-tab
 */
export const getImageLibrarySubTabIndex = (
  subTabs: ImageLibrarySubTab[],
  selectedTab: ImageLibraryType | undefined
) => {
  if (selectedTab === undefined) {
    return 0;
  }

  const tabIndex = subTabs.findIndex((tab) => tab.type === selectedTab);

  if (tabIndex === -1) {
    return 0;
  }

  return tabIndex;
};
