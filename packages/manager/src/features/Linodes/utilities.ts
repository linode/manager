/**
 * Checks if a region is aclp supported based on a comma-separated string.
 * A single "*" means all regions are supported.
 *
 * @param selectedRegion - Region to check.
 * @param aclpSupportedRegions - Comma-separated supported regions (for eg., "us-ord,us-east" or "*").
 */
export const isAclpSupportedRegion = (
  selectedRegion: string | undefined,
  aclpSupportedRegions: string | undefined
) => {
  if (!aclpSupportedRegions) return false;

  if (aclpSupportedRegions.includes('*')) {
    return true;
  }

  if (!selectedRegion) {
    return false;
  }

  const supportedRegions = aclpSupportedRegions
    .split(',')
    .map((region) => region.trim());

  return supportedRegions.includes(selectedRegion);
};
