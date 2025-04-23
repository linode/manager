import { DEFAULT_ERROR_MESSAGE } from 'src/constants';

import type { APIError } from '@linode/api-v4/lib/types';

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
 *  .catch((e: APIError[]) => getAPIErrorOrDefault(e, 'There was an error', 'label'))
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
  errorResponse: APIError[],
  defaultError: string = DEFAULT_ERROR_MESSAGE,
  field?: string
): APIError[] => {
  const _defaultError = field
    ? [{ field, reason: defaultError }]
    : [{ reason: defaultError }];

  return isDefaultError(errorResponse) ? _defaultError : errorResponse;
};

const isDefaultError = (errorResponse: APIError[]) => {
  return (
    errorResponse &&
    errorResponse.length === 1 &&
    errorResponse[0].reason === DEFAULT_ERROR_MESSAGE
  );
};

export const getErrorStringOrDefault = (
  errors: APIError[] | string,
  defaultError: string = 'An unexpected error occurred.'
): string => {
  if (typeof errors === 'string') {
    return errors;
  }
  return errors?.[0]?.reason ?? defaultError;
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
// type = GetReturnType<E, Record<T | 'none', (string | undefined)>>
export const getErrorMap = <T extends string = string>(
  fields: T[] = [],
  errors?: APIError[] | null
): Partial<Record<'none' | T, string | undefined>> => {
  if (!errors) {
    return {} as Partial<Record<any, any>>;
  }
  return errors.reduce(
    (accum, thisError) => {
      if (thisError.field && fields.includes(thisError.field as T)) {
        return {
          ...accum,
          // We generally want the first error that matches the field,
          // so don't override it if it's already there
          [thisError.field]: accum[thisError.field] || thisError.reason,
        };
      } else {
        return {
          ...accum,
          none: thisError.reason,
        };
      }
    },
    { none: undefined } as Record<string, string | undefined>
  ) as Record<'none' | T, string | undefined>;
};
