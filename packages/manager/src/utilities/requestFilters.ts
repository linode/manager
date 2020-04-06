/**
 * Generates a "found in filter" list filter for the API.
 * @example
 *   generateInFilter('id', [1, 22, 333, 4444]);
 *   would produce { '+or': [1, 22, 333, 4444] }
 *   and reads as "where `id` is 1, 22, 333, or 4444."
 */
export const generateInFilter = (keyName: string, arr: any[]) => {
  return {
    '+or': arr.map(el => ({ [keyName]: el }))
  };
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
export const generatePollingFilter = (timestamp: string, ids: string[]) => {
  // @todo: Add check to NOT request events already in store (by ID).
  return ids.length
    ? {
        '+or': [{ created: { '+gte': timestamp } }, generateInFilter('id', ids)]
      }
    : {
        created: { '+gte': timestamp }
      };
};
