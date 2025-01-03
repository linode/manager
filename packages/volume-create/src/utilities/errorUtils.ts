import { APIError } from "@linode/api-v4/lib/types";

import { DEFAULT_ERROR_MESSAGE } from "src/constants";

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
  field?: string,
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
