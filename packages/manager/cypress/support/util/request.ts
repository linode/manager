/**
 * @file Utility functions for reading and manipulating HTTP request objects.
 */

import type { CyHttpMessages } from 'support/cypress-exports';

/**
 * Wraps the given value in an array if it is not already an array.
 *
 * @param value - Value to arrayify.
 *
 * @returns `value` or an array containing `value`.
 */
const arrayify = <T>(value: T | T[]): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
};

/**
 * Returns an object describing the `x-filter` specified for a given request.
 *
 * Returns `undefined` if no `x-filter` filters are specified or if the given
 * filters are malformed.
 *
 * @param req - Cypress HTTP request object.
 *
 * @returns Object describing filters, or `undefined`.
 */
export const getFilters = (
  req: CyHttpMessages.IncomingHttpRequest
): Record<string, unknown> | undefined => {
  if (req.headers['x-filter']) {
    // Header values can be an array of strings, but in our case it shouldn't be.
    // If we are provided multiple strings, we will only look at the first.
    const filterValues = arrayify(req.headers['x-filter']);
    for (const filterValue of filterValues) {
      try {
        return JSON.parse(filterValue);
      } catch (e) {
        console.log('Failed to parse header "x-filter" value.', e.message);
      }
    }
  }

  return undefined;
};
