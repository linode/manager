import { pathOr } from 'ramda';
import { DEFAULT_ERROR_MESSAGE } from 'src/constants';

/**
 *
 * Override the default error message provided by our Axios
 * interceptor with a more situation-specific message.
 *
 * @todo rename this method
 * @todo make the second argument required, so we're not
 * overriding the default error with the same default error
 * in some cases.
 *
 * @example
 *
 * fetchData()
 *  .then()
 *  .catch((e: Linode.ApiFieldError[]) => getAPIErrorOrDefault(e, 'There was an error', 'label'))
 *
 * @param { AxiosError } - Error response from some API request
 * @param { string } - Default error message on the "reason" key
 * @param { string } - Default error field on the "field" key
 *
 * @returns Linode.APIError[]
 *
 * [ { reason: 'Label is too long', field: 'label' } ]
 *
 */
export const getAPIErrorOrDefault = (
  errorResponse: Linode.ApiFieldError[],
  defaultError: string = DEFAULT_ERROR_MESSAGE,
  field?: string
): Linode.ApiFieldError[] => {
  const _defaultError = field
    ? [{ reason: defaultError, field }]
    : [{ reason: defaultError }];

  return isDefaultError(errorResponse) ? _defaultError : errorResponse;
};

const isDefaultError = (errorResponse: Linode.ApiFieldError[]) => {
  return (
    errorResponse &&
    errorResponse.length === 1 &&
    errorResponse[0].reason === DEFAULT_ERROR_MESSAGE
  );
};

export const handleUnauthorizedErrors = (
  e: Linode.ApiFieldError[],
  unauthedMessage: string
) => {
  /**
   * filter out errors that match the following
   * {
   *   reason: "Unauthorized"
   * }
   *
   * and if any of these errors exist, set the hasUnauthorizedError
   * flag to true
   */
  let hasUnauthorizedError = false;
  const filteredErrors = e.filter(eachError => {
    if (eachError.reason.toLowerCase().includes('unauthorized')) {
      hasUnauthorizedError = true;
      return false;
    }
    return true;
  });

  /**
   * if we found an unauthorized error, add on the new message in the API
   * Error format
   */
  return hasUnauthorizedError
    ? [
        {
          reason: unauthedMessage
        },
        ...filteredErrors
      ]
    : filteredErrors;
};

export const getErrorStringOrDefault = (
  errors: Linode.ApiFieldError[] | string,
  defaultError: string = 'An unexpected error occurred.'
): string => {
  if (typeof errors === 'string') {
    return errors;
  }
  const apiErrors = pathOr(errors, ['response', 'data', 'errors'], errors);
  return pathOr<string>(defaultError, [0, 'reason'], apiErrors);
};

/**
 * Returns a mapping of error fields to responses. Intended for mapping
 * API errors to input fields or other field-specific displays.
 *
 * Any errors which do not have a field, or do not match any specified field,
 * will be assigned to the 'none' key. If there are multiple errors in this category,
 * only one will be included in the map. This is not ideal, but the point of this
 * function is to make sure that if a request returns an error, some usable feedback
 * will be available to the user.
 *
 * @example getErrorMap(['label','password'], errors)
 *
 * {
 *    'label': 'This label is too long.',
 *    'password': 'Must contain special characters.',
 *    'none': 'You forgot to check for region errors.'
 * }
 *
 *
 * @param fields optional list of fields to include in the response object
 * @param errors an API error response
 */
export const getErrorMap = (
  fields: string[] = [],
  errors?: Linode.ApiFieldError[]
): Record<string, string | undefined> => {
  if (!errors) {
    return {};
  }
  return errors.reduce(
    (accum, thisError) => {
      if (thisError.field && fields.includes(thisError.field)) {
        return {
          ...accum,
          [thisError.field]: thisError.reason
        };
      } else {
        return {
          ...accum,
          none: thisError.reason
        };
      }
    },
    { none: undefined }
  );
};
