/**
 * @file Utilities related to Cypress HTTP request intercepts.
 */

/**
 * Returns a glob pattern to match against the given API endpoint.
 *
 * @param endpointPattern - API v4 endpoint pattern for URL matcher.
 *
 * @returns Intercept glob pattern for the given API endpoint.
 */
export const apiMatcher = (endpointPattern: string): string => {
  return `**/+(v4|v4beta)/${endpointPattern}`;
};
