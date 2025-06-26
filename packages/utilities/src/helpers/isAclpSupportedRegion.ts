import type { MonitoringCapabilities, Region } from '@linode/api-v4';

interface IsAclpSupportedRegionParams {
  /**
   * The capability to check ('Linodes', 'NodeBalancers', etc)
   */
  capability: MonitoringCapabilities[keyof MonitoringCapabilities][number];
  /**
   * Region ID to check
   */
  regionId: string | undefined;
  /**
   * Available regions from the API
   */
  regions: Region[] | undefined;
  /**
   * The monitoring type ('metrics' or 'alerts')
   */
  type: keyof MonitoringCapabilities;
}

/**
 * Checks if the selected region is ACLP-supported for the given type, capability,
 * and based on the /regions api endpoint.
 *
 * @param object - An object with params: type, capability, regions, and regionId
 */
export const isAclpSupportedRegion = ({
  capability,
  regionId,
  regions,
  type,
}: IsAclpSupportedRegionParams): boolean => {
  if (!regionId || !regions) return false;

  const region = regions.find((region) => region.id === regionId);

  return region?.monitors?.[type]?.includes(capability) ?? false;
};
