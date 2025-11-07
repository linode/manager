import { DateTime } from 'luxon';
import { randomItem } from 'support/util/random';

import type { Image, ImageCapabilities } from '@linode/api-v4';

/**
 * Images that cannot be selected using `chooseImages()`.
 */
const disallowedImageIds: string[] = [];

/**
 * All Linode images available to the current Cloud Manager user.
 *
 * Retrieved via Linode APIv4 during Cypress start-up.
 */
export const images: Image[] = Cypress.env('cloudManagerImages') as Image[];

/**
 * Returns a known Cloud Manager image at random, or returns a user-chosen
 * image if one was specified.
 *
 * @param options - Image selection options.
 *
 * @returns Object describing a Cloud Manager image to use during tests.
 */
export const chooseImage = (options?: ChooseImageOptions): Image => {
  return randomItem(resolveSearchImages(options));
};

/**
 * Returns an array of Image objects that meet the given criteria.
 *
 * @param options - Object describing Image selection criteria.
 *
 * @throws If no images meet the desired criteria.
 * @throws If an override image is specified which does not meet the given criteria.
 *
 * @returns Array of Image objects that meet criteria specified by `options` param.
 */
const resolveSearchImages = (options?: ChooseImageOptions): Image[] => {
  const currentImages = images.filter((image) => {
    if (image.eol === null) {
      return image.deprecated;
    }
    const isImageEOL = DateTime.fromISO(image.eol) < DateTime.now();
    return image.deprecated || isImageEOL;
  });
  const requiredCapabilities = options?.capabilities ?? [];
  const allDisallowedImageIds = [
    ...disallowedImageIds,
    ...(options?.exclude ?? []),
  ];
  const capableImages = imagesWithCapabilities(
    options?.images ?? currentImages,
    requiredCapabilities
  ).filter((image: Image) => !allDisallowedImageIds.includes(image.id));

  if (!capableImages.length) {
    throw new Error(
      `No images are available with the required capabilities: ${requiredCapabilities.join(
        ', '
      )}`
    );
  }
  return capableImages;
};

/**
 * Returns `true` if the given Image has all of the given capabilities and availability for each capability.
 *
 * @param image - Image to check capabilities.
 * @param capabilities - ImageCapabilities to check.
 *
 * @returns `true` if `image` has all of the given capabilities.
 */
const imageHasCapabilities = (
  image: Image,
  capabilities: ImageCapabilities[]
): boolean => {
  return capabilities.every((capability) =>
    image.capabilities.includes(capability)
  );
};

/**
 * Returns an array of Image objects that have all of the given capabilities.
 *
 * @param images - Images from which to search.
 * @param capabilities - ImageCapabilities to check.
 *
 * @returns Array of Image objects containing the required capabilities.
 */
const imagesWithCapabilities = (
  images: Image[],
  capabilities: ImageCapabilities[]
): Image[] => {
  return images.filter((image: Image) =>
    imageHasCapabilities(image, capabilities)
  );
};

/**
 * Returns an object describing a Cloud Manager image with the given label.
 *
 * If no known image exists with the given human-readable label, an error is
 * thrown.
 *
 * @param label - Label (API or Cloud-specific) of the image to find.
 * @param searchImages - Optional array of Images from which to search.
 *
 * @throws When no image exists in the `images` array with the given label.
 */
export const getImageByLabel = (label: string, searchImages?: Image[]) => {
  const image = (searchImages ?? images).find(
    (findImage: Image) => findImage.label === label
  );
  if (!image) {
    throw new Error(
      `Unable to find image by label. Unknown image label '${label}'.`
    );
  }
  return image;
};

interface ChooseImageOptions {
  /**
   * If specified, the image returned will support the defined capabilities
   * @example ['cloud-init', 'distributed-sites']
   */
  capabilities?: ImageCapabilities[];

  /**
   * Array of image IDs to exclude from results.
   */
  exclude?: string[];

  /**
   * Images from which to choose. If unspecified, Images exposed by the API will be used.
   */
  images?: Image[];
}
