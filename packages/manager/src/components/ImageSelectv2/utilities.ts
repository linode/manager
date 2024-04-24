import { ImageSelectVariant } from './ImageSelectv2';

import type { Image } from '@linode/api-v4';

/**
 * Given a Image Select "variant", this PR returns an
 * API filter to help you fetch the correct images.
 */
export const getAPIFilterForImageSelect = (
  variant: ImageSelectVariant | undefined
) => {
  if (variant === 'public') {
    return { '+order': 'desc', '+order_by': 'label', is_public: true };
  }

  if (variant === 'private') {
    return { is_public: false };
  }

  return {};
};

/**
 * Using API filter, I can't think of a way to filter out
 * LKE images that we don't want customers to see.
 *
 * This function exists to filter out public Kubernetes images
 * for the Images Select.
 *
 * Please use API filtering (getAPIFilterForImageSelect) when possible!
 */
export const getFilteredImagesForImageSelect = (
  images: Image[] | undefined,
  variant: ImageSelectVariant | undefined
) => {
  return variant === 'private'
    ? images
    : images?.filter((image) => !image.id.includes('kube'));
};
