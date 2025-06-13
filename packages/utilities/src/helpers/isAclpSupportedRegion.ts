import type { MonitoringCapabilities, Region } from '@linode/api-v4';

interface IsAclpSupportedRegionParams {
  /**
   * The type of monitoring to check (e.g., 'metrics', 'alerts')
   */
  aclpMonitoringType: keyof MonitoringCapabilities;
  /**
   * The specific capability to check (e.g., 'Linodes', 'NodeBalancers', etc)
   */
  featureCapability: MonitoringCapabilities[keyof MonitoringCapabilities][number];
  /**
   * The list of all available regions from regions query.
   */
  regions: Region[] | undefined;
  /**
   * Region Id to check.
   */
  selectedRegionId: string | undefined;
}

/**
 * Checks if the selected region is ACLP-supported for the given aclpMonitoringType, featureCapability,
 * and based on the /regions api endpoint.
 *
 * @param object -  Object containing aclpMonitoringType, featureCapability, selectedRegionId, and regions.
 */
export const isAclpSupportedRegion = ({
  aclpMonitoringType,
  featureCapability,
  regions,
  selectedRegionId,
}: IsAclpSupportedRegionParams) => {
  if (!selectedRegionId || !regions) return false;

  const region = regions.find((region) => region.id === selectedRegionId);

  return (
    region?.monitors?.[aclpMonitoringType].includes(featureCapability) ?? false
  );
};
