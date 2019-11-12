import { APIError } from 'linode-js-sdk/lib/types';
import { reportException } from 'src/exceptionReporting';

export const handleUnauthorizedErrors = (
  e: APIError[],
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
  let filteredErrors: APIError[] = [];

  try {
    filteredErrors = e.filter(eachError => {
      if (
        typeof eachError.reason === 'string' &&
        eachError.reason.toLowerCase().includes('unauthorized')
      ) {
        hasUnauthorizedError = true;
        return false;
      }
      return true;
    });
  } catch (caughtError) {
    reportException(`Error with Unauthed error handling: ${caughtError}`, {
      apiError: e
    });
  }

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
