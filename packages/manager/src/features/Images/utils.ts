import { useRegionsQuery } from '@linode/queries';
import { useMemo } from 'react';

import { DISALLOWED_IMAGE_REGIONS } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';

import type { Event, Image, Linode } from '@linode/api-v4';
import type { Hidden } from '@linode/ui';

interface ImagesSubTab {
  isBeta?: boolean;
  key: ImagesVariant;
  title: string;
}

export interface ColumnConfig {
  header: React.ReactNode | string;
  hiddenProps?: React.ComponentProps<typeof Hidden>;
  label?: string; // Field name (used for sorting)
  sortable?: boolean;
}

export type ImagesVariant = 'custom' | 'recovery' | 'shared';

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
 * Returns the currently selected Images sub-tab index and the list of available sub-tabs.
 *
 * @param tab - the current tab. Currently, this value comes from 'subType' query param on the Images Landing Page.
 * @returns An object containing:
 *   - `subTabIndex`: the index of the selected sub-tab
 *   - `subTabs`: the array of available sub-tabs
 */
export const useImagesSubTabs = (tab: ImagesVariant | undefined) => {
  const flags = useFlags();

  const subTabs = useMemo(() => {
    const tabs: ImagesSubTab[] = [
      { key: 'custom', title: 'My custom images' },
      ...(flags.privateImageSharing
        ? [
            {
              key: 'shared' as ImagesVariant,
              title: 'Shared with me',
              isBeta: true,
            },
          ]
        : []),
      { key: 'recovery', title: 'Recovery images' },
    ];

    return tabs;
  }, [flags.privateImageSharing]);

  const subTabIndex = useMemo(() => {
    const keys = subTabs.map((t) => t.key);
    const foundIndex = tab ? keys.indexOf(tab) : -1;
    return foundIndex >= 0 ? foundIndex : 0;
  }, [tab, subTabs]);

  return { subTabIndex, subTabs };
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
