import { DateTime } from 'luxon';

import { MAX_MONTHS_EOL_FILTER } from 'src/constants';

import type { ImageSelectVariant } from './ImageSelect';
import type { Image } from '@linode/api-v4';

/**
 * Given a Image Select "variant", this PR returns an
 * API filter to help you fetch the correct images.
 */
export const getAPIFilterForImageSelect = (
  variant: ImageSelectVariant | undefined
) => {
  if (variant === 'public') {
    return {
      '+order': 'desc',
      '+order_by': 'label',
      is_public: true,
    };
  }

  if (variant === 'private') {
    return { is_public: false };
  }

  return {};
};

/**
 * Unfortunately, we can't use API filtering for all of our filtering needs.
 *
 * This function exists to...
 * - filter out public Kubernetes images for the Images Select
 * - filter out images that are too far past their end-of-life date
 *
 * Please use API filtering (getAPIFilterForImageSelect) when possible!
 */
export const getFilteredImagesForImageSelect = (
  images: Image[] | undefined,
  variant: ImageSelectVariant | undefined
) => {
  if (variant === 'public') {
    // For public images, we filter out LKE images and images that are > 6 months past their `eol`
    return images?.filter(
      (image) => !image.id.includes('kube') && !isImageTooFarPastEOL(image)
    );
  }

  return images;
};

/**
 * Returns whether or not an image is too far past its end-of-life based on MAX_MONTHS_EOL_FILTER
 *
 * This function is intended to be used to filter out end-of-life images based on
 * an internal policy. See `M3-5753` for context.
 *
 * @param image an image from the API
 * @returns true if the given image is more than 6 months past its end-of-life
 */
export const isImageTooFarPastEOL = (image: Image) => {
  if (image.eol === null) {
    return false;
  }

  const imageEOL = DateTime.fromISO(image.eol);
  const now = DateTime.now();

  const differenceInMonths = now.diff(imageEOL, 'months').months;

  return differenceInMonths > MAX_MONTHS_EOL_FILTER;
};

/**
 * Returns whether or not an image is deprecated
 *
 * Unfortunately, as per `M3-5753`, we can't just simply check `deprecated` on the `Image`,
 * we must also consider the EOL date.
 */
export const isImageDeprecated = (image: Image) => {
  if (image.eol === null) {
    // If the image does not have an EOL, just use the `deprecated` field returned by the API
    return image.deprecated;
  }

  const isImageEOL = DateTime.fromISO(image.eol) < DateTime.now();

  return image.deprecated || isImageEOL;
};
