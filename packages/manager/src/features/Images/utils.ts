import { useAllLinodesQuery, useRegionsQuery } from '@linode/queries';

import { DISALLOWED_IMAGE_REGIONS } from 'src/constants';

import { useQueryWithPermissions } from '../IAM/hooks/usePermissions';

import type { Event, Image, Linode } from '@linode/api-v4';

/**
 * Get a list of Linodes that the user has read/write access to via AIM RBAC permissions mapping
 */
export const useLinodesPermissionsCheck = (
  enabled: boolean
): {
  availableLinodes: number[];
  isLoading: boolean;
} => {
  const { data: availableLinodes, isLoading } = useQueryWithPermissions<Linode>(
    useAllLinodesQuery(),
    'linode',
    ['view_linode', 'update_linode'],
    enabled
  );

  return {
    availableLinodes: availableLinodes?.map((linode) => linode.id) ?? [],
    isLoading,
  };
};

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
