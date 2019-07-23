/*
 * Gets images by two types: deprecated and non-deprecated
 */
const getImagesByDeprecationStatus = (
  images: Linode.Image[],
  deprecated: boolean
) => {
  return images.filter(image => image.deprecated === deprecated);
};

export default getImagesByDeprecationStatus;
