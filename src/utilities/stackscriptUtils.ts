/**
 * Helpers for StackScripts and user-defined fields
 */

/**
 * @returns { Linode.Image[] } - a list of public images AKA
 * images that are officially supported by Linode
 */
export const filterPublicImages = (images: Linode.Image[]) => {
  return images.filter((image: Linode.Image) => image.is_public);
};

/**
 * filter out all the API errors that aren't UDF errors from our error state.
 * To do this, we compare the keys from the error state to our "errorResources"
 * map and return all the errors that don't match the keys in that object
 */
export const filterUDFErrors = (
  errorKeys: string[],
  errors?: Linode.ApiFieldError[]
) => {
  return !errors
    ? []
    : errors.filter(eachError => {
        return !errorKeys.some(eachKey => eachKey === eachError.field);
      });
};
