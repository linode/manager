import { Image } from 'linode-js-sdk/lib/images';

/*
 * Gets images by two types: deprecated and non-deprecated
 */
const getImagesByDeprecationStatus = (images: Image[], deprecated: boolean) => {
  return images.filter(image => image.deprecated === deprecated);
};

export default getImagesByDeprecationStatus;
