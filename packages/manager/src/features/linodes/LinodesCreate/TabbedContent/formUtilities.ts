import { APIError } from '@linode/api-v4/lib/types';

/**
 * filter out all the API errors that aren't UDF errors from our error state.
 * To do this, we compare the keys from the error state to our "errorResources"
 * map and return all the errors that don't match the keys in that object
 */
export const filterUDFErrors = (
  errorResources: Record<string, string>,
  errors?: APIError[]
) => {
  if (typeof errorResources !== 'object') {
    throw Error('errorResources must be an object.');
  }
  return !errors
    ? []
    : errors.filter((eachError) => {
        return !Object.keys(errorResources).some(
          (eachKey) => eachKey === eachError.field
        );
      });
};
