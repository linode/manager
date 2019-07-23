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
 * Generates a filter for API reqeusts;
 * If we have IDs:
 *  "If `created` is greater than the datestamp provided or the `id` is one of ids."
 * or:
 *   "If `created` is greater than the datestamp provided."
 *
 * This filter is invoked on every events request to only get the latest or in-progress events.
 */
export const generatePollingFilter = (datestamp: string, ids: string[]) => {
  return ids.length
    ? {
        '+or': [{ created: { '+gt': datestamp } }, generateInFilter('id', ids)]
      }
    : {
        created: { '+gt': datestamp }
      };
};
