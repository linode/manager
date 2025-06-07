import type { MonitorCapabilities, Region } from '@linode/api-v4';

// @todo - Add unit tests for this utility

/**
 * Checks if a region is aclp supported for the monitorCapability service type based on /regions end point.
 *
 * @param monitorCapability - monitorCapability servicetype to check for (eg., Linodes, DBAAS, etc).
 * @param selectedRegion - Region to check.
 * @param regions - all the regions from regions query.
 */
export const isAclpSupportedRegion = (
  monitorCapability: MonitorCapabilities,
  selectedRegion: string | undefined,
  regions: Region[] | undefined
) => {
  if (!regions) return false;

  const region = regions.find((region) => region.id === selectedRegion);

  if (!region) {
    return false;
  }
  return region.monitors.includes(monitorCapability);
};
