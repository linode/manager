import { Image } from 'linode-js-sdk/lib/images';

export const filterImagesByType = (
  images: Record<string, Image>,
  type: 'public' | 'private'
): Record<string, Image> => {
  return Object.keys(images).reduce((acc, eachKey) => {
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
