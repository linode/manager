/**
 * @file Utility functions to easily create HTTP response objects for Cypress tests.
 */

import type { StaticResponse } from 'support/cypress-exports';

/**
 * Creates an HTTP response object with the given body data.
 *
 * @param body - Response body data. Default is `{}`.
 * @param statusCode - Response HTTP status. Default is `200`.
 *
 * @returns HTTP response object.
 */
export const makeResponse = (
  body: any = {},
  statusCode: number = 200
): Partial<StaticResponse> => {
  return {
    body,
    statusCode,
  };
};
