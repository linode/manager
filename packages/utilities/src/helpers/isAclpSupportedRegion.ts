import type { AclpServiceTypeCapabilities, Region } from '@linode/api-v4';

/**
 * Checks if the selected region is ACLP-supported for the given service type capability,
 * and based on the /regions api endpoint.
 *
 * @param aclpServiceTypeCapability - aclpServiceTypeCapability to check for (eg., Linodes, DBAAS, etc).
 * @param selectedRegion - Region to check.
 * @param regions - The list of all available regions from regions query.
 */
export const isAclpSupportedRegion = (
  aclpServiceTypeCapability: AclpServiceTypeCapabilities,
  selectedRegion: string | undefined,
  regions: Region[] | undefined,
) => {
  if (!selectedRegion || !regions) return false;

  const region = regions.find((region) => region.id === selectedRegion);

  return region?.monitors.includes(aclpServiceTypeCapability) ?? false;
};
