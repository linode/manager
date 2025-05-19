type SortOrder = 'asc' | 'desc';

export const sortByString = (a: string, b: string, order: SortOrder) => {
  let result = 0;
  if (a.toLowerCase() < b.toLowerCase()) {
    result = -1;
  } else if (a.toLowerCase() > b.toLowerCase()) {
    result = 1;
  }
  if (order === 'asc') {
    return result; // ascending order
  }
  return -result; // descending order
};

export const sortByNumber = (a: number, b: number, order: SortOrder) => {
  let result = 0;
  if (a < b) {
    result = -1;
  } else if (a > b) {
    result = 1;
  }
  if (order === 'asc') {
    return result; // ascending order
  }
  return -result; // descending order
};

export const sortByArrayLength = (a: any[], b: any[], order: SortOrder) => {
  let result = 0;
  if (a.length > b.length) {
    result = 1;
  } else if (a.length < b.length) {
    result = -1;
  }

  return order === 'asc' ? result : -result;
};

/**
 * Compares two semantic version strings based on the specified order.
 *
 * This function splits each version string into its constituent parts (major, minor, patch),
 * compares them numerically, and returns a positive number, zero, or a negative number
 * based on the specified sorting order. If components are missing in either version,
 * they are treated as zero.
 *
 * @param {string} a - The first version string to compare.
 * @param {string} b - The second version string to compare.
 * @param {SortOrder} order - The order to sort by, can be 'asc' for ascending or 'desc' for descending.
 * @returns {number} Returns a positive number if version `a` is greater than `b` according to the sort order,
 *                   zero if they are equal, and a negative number if `b` is greater than `a`.
 *
 * @example
 * // returns a positive number
 * sortByVersion('1.2.3', '1.2.2', 'asc');
 *
 * @example
 * // returns zero
 * sortByVersion('1.2.3', '1.2.3', 'asc');
 *
 * @example
 * // returns a negative number
 * sortByVersion('1.2.3', '1.2.4', 'asc');
 */

export const sortByVersion = (
  a: string,
  b: string,
  order: SortOrder,
): number => {
  const aParts = a.split('.');
  const bParts = b.split('.');

  const result = (() => {
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i += 1) {
      // If one version has a part and another doesn't (e.g. 3.1 vs 3.1.1),
      // treat the missing part as 0.
      const aNumber = Number(aParts[i]) || 0;
      const bNumber = Number(bParts[i]) || 0;
      const diff = aNumber - bNumber;

      if (diff !== 0) {
        return diff;
      }
    }
    return 0;
  })();

  return order === 'asc' ? result : -result;
};

// TODO: need to test this with standard tiered version endpoints
/**
 * For Beta rollout, LKE-E clusters are using the new v4beta tiered version endpoint and standard clusters are using the existing v4 version endpoint.
 * Once LKE-E hits GA, we should transition to only using the v4 tiered version endpoints for enterprise *and* standard (https://techdocs.akamai.com/linode-api/reference/get-lke-tiers-versions).
 * At that point, we can just call sortByTieredVersion in kubeDetails.
 * @param {string} a - The first version string to compare. Supports formatting for LKE-E versions.
 * @param {string} b - The second version string to compare. Supports formatting for LKE-E versions.
 * @param {SortOrder} order - The order to sort by, can be 'asc' for ascending or 'desc' for descending.
 * @returns {number} Returns a positive number if version `a` is greater than `b` according to the sort order,
 *                   zero if they are equal, and a negative number if `b` is greater than `a`.
 */
export const sortByTieredVersion = (
  a: string,
  b: string,
  order: SortOrder,
): number => {
  // Remove the 'v' prefix and split the core version (X.X.X) from the enterprise release version (+lkeX).
  const aCleanVersion = a.replace('v', '');
  const bCleanVersion = b.replace('v', '');
  const [aCoreVersion, aEnterpriseVersion] = aCleanVersion.split('+');
  const [bCoreVersion, bEnterpriseVersion] = bCleanVersion.split('+');

  const aParts = aCoreVersion.split('.');
  const bParts = bCoreVersion.split('.');
  const aEnterpriseVersionNum = Number(aEnterpriseVersion.replace(/\D+/g, ''));
  const bEnterpriseVersionNum = Number(bEnterpriseVersion.replace(/\D+/g, ''));

  const result = (() => {
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i += 1) {
      // If one version has a part and another doesn't (e.g. 3.1 vs 3.1.1),
      // treat the missing part as 0.
      const aNumber = Number(aParts[i]) || 0;
      const bNumber = Number(bParts[i]) || 0;
      const diff = aNumber - bNumber;

      if (diff !== 0) {
        return diff;
      }
    }
    // If diff is 0, the core versions are the same, so compare the enterprise release version numbers.
    return aEnterpriseVersionNum - bEnterpriseVersionNum;
  })();

  return order === 'asc' ? result : -result;
};
