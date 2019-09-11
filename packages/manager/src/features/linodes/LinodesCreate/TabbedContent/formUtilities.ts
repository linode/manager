import { Image } from 'linode-js-sdk/lib/images';

/**
 * @returns { Image[] } - a list of public images AKA
 * images that are officially supported by Linode
 *
 */
export const filterPublicImages = (images: Image[]) => {
  return images.filter((image: Image) => image.is_public);
};

/**
 * filter out all the API errors that aren't UDF errors from our error state.
 * To do this, we compare the keys from the error state to our "errorResources"
 * map and return all the errors that don't match the keys in that object
 */
export const filterUDFErrors = (
  errorResources: Record<string, string>,
  errors?: Linode.ApiFieldError[]
) => {
  if (typeof errorResources !== 'object') {
    throw Error('errorResources must be an object.');
  }
  return !errors
    ? []
    : errors.filter(eachError => {
        return !Object.keys(errorResources).some(
          eachKey => eachKey === eachError.field
        );
      });
};
