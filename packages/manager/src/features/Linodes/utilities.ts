/**
 * Checks if a region is aclp supported based on a comma-separated string.
 * A single "*" means all regions are supported.
 *
 * @param selectedRegion - Region to check.
 * @param aclpSupportedRegions - Comma-separated supported regions (for eg., "us-iad,us-east" or "*").
 */
export const isAclpSupportedRegion = (
  selectedRegion: string | undefined,
  aclpSupportedRegions: string | undefined
) => {
  if (!aclpSupportedRegions) return false;

  if (aclpSupportedRegions === '*') {
    return true;
  }

  if (!selectedRegion) {
    return false;
  }

  return aclpSupportedRegions
    .split(',')
    .some((region) => region.trim() === selectedRegion);
};
