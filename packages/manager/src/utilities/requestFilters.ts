/**
 * Generates a "found in filter" list filter for the API.
 * @example
 *   generateInFilter('id', [1, 22, 333, 4444]);
 *   would produce { '+or': [1, 22, 333, 4444] }
 *   and reads as "where `id` is 1, 22, 333, or 4444."
 */
export const generateInFilter = (keyName: string, arr: (string | number)[]) => {
  return arr.map(el => ({ [keyName]: el }));
};

export const generateNeqFilter = (
  keyName: string,
  arr: (string | number)[]
) => {
  return arr.map(el => ({ [keyName]: { '+neq': el } }));
};

/**
 * Generates a filter for API requests;
 * If we have IDs:
 *  "If `created` is greater than the timestamp provided or the `id` is one of ids."
 * or:
 *   "If `created` is greater than the timestamp provided."
 *
 * This filter is invoked on every events request to only get the latest or in-progress events.
 */
export const generatePollingFilter = (
  timestamp: string,
  inIds: number[] = [],
  neqIds: number[] = []
) => {
  let filter: any = { created: { '+gte': timestamp } };

  if (neqIds.length > 0) {
    filter = {
      '+and': [...filter, ...generateNeqFilter('id', neqIds)],
    };
  }

  if (inIds.length > 0) {
    filter = {
      '+or': [...filter, ...generateInFilter('id', inIds)],
    };
  }

  return filter;
};
