import { useRegionsQuery } from '@linode/queries';

import { DISALLOWED_IMAGE_REGIONS } from 'src/constants';

import type { Event, Image, Linode } from '@linode/api-v4';

export const filterImagesByType = (
  images: Record<string, Image>,
  type: 'private' | 'public'
) => {
  return Object.keys(images).reduce<Record<string, Image>>((acc, eachKey) => {
    /** keep the public images if we're filtering by public images */
    if (type === 'public' && !!images[eachKey].is_public) {
      acc[eachKey] = images[eachKey];
    }

    /** keep the private images if we're filtering by private images */
    if (type === 'private' && !images[eachKey].is_public) {
      acc[eachKey] = images[eachKey];
    }

    return acc;
  }, {});
};

/**
 * isLinodeKubeImageId helps us determine if an Image is an
 * LKE (Linode Kubernetes Engine) image. In Cloud Manager, we hide
 * these images from the user.
 *
 * Image IDs are in the form linode/ubuntu24.04 or private/15943292
 *
 * @param {string | null} id the image's id (unlike most entities, image ids are string)
 * @returns {boolean} true if the image is an LKE image
 */
export const isLinodeKubeImageId = (id: null | string): boolean => {
  return Boolean(id?.startsWith('linode/')) && Boolean(id?.includes('kube'));
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
