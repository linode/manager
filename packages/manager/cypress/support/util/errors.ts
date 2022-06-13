/**
 * @file Utility functions to easily create errors and error responses for API mocking.
 */

import { makeResponse } from './response';

/**
 * Creates an API error object that describes one or more errors.
 *
 * @param error - String or array of strings describing errors.
 *
 * @returns API error object containing the given error or errors.
 */
export const makeError = (error: string | string[]) => {
  const errorArray = Array.isArray(error) ? error : [error];
  return {
    errors: errorArray.map((errorString: string) => {
      return {
        reason: errorString,
      };
    }),
  };
};

/**
 * Creates an API error response that describes one or more errors.
 *
 * @param error - String or array of strings describing errors.
 * @param statusCode - HTTP status code for created response. Default `400`.
 *
 * @returns HTTP response object containing the given error or errors.
 */
export const makeErrorResponse = (
  error: string | string[],
  statusCode: number = 400
) => {
  return makeResponse(makeError(error), statusCode);
};
