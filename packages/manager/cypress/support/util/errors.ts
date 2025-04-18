/**
 * @file Utility functions to easily create errors and error responses for API mocking.
 */

import { makeResponse } from './response';

import type { APIError } from '@linode/api-v4';

/**
 * Describes a mock API error.
 *
 * Can be expressed as a string, or as an actual `APIError` instance.
 */
export type APIErrorContents = string | APIError;

/**
 * Creates an API error object that describes one or more errors.
 *
 * @param error - String or array of strings describing errors.
 *
 * @returns API error object containing the given error or errors.
 */
export const makeError = (error: APIErrorContents | APIErrorContents[]) => {
  const errorArray = Array.isArray(error) ? error : [error];

  return {
    errors: errorArray.map((error: APIErrorContents) => {
      if (typeof error === 'string') {
        return {
          reason: error,
        };
      }

      return error;
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
  error: APIErrorContents | APIErrorContents[],
  statusCode: number = 400
) => {
  return makeResponse(makeError(error), statusCode);
};
