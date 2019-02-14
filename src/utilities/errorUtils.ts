import { AxiosError } from 'axios';
import { pathOr } from 'ramda';

export const getAPIErrorOrDefault = (
  errorResponse: Linode.ApiFieldError[] | AxiosError,
  defaultError: string = 'An unexpected error occurred.',
  field?: string
): Linode.ApiFieldError[] => {
  const _defaultError = field
    ? [{ reason: defaultError, field }]
    : [{ reason: defaultError }];

  return pathOr(_defaultError, ['response', 'data', 'errors'], errorResponse);
};

export const getErrorStringOrDefault = (
  errors: Linode.ApiFieldError[],
  defaultError: string = 'An unexpected error occurred.'
): string => {
  return pathOr<string>(defaultError, [0, 'reason'], errors);
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
