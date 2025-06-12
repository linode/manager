import type { MonitoringCapabilities, Region } from '@linode/api-v4';

/**
 * Checks if the selected region is ACLP-supported for the given aclpMonitoringType, featureCapability,
 * and based on the /regions api endpoint.
 *
 * @param aclpMonitoringType - The type of monitoring to check (e.g., 'metrics', 'alerts')
 * @param featureCapability - The specific capability to check (e.g., 'Linodes', 'NodeBalancers', etc)
 * @param selectedRegionId - Region Id to check.
 * @param regions - The list of all available regions from regions query.
 */
export const isAclpSupportedRegion = (
  aclpMonitoringType: keyof MonitoringCapabilities,
  featureCapability: MonitoringCapabilities[keyof MonitoringCapabilities][number],
  selectedRegionId: string | undefined,
  regions: Region[] | undefined,
) => {
  if (!selectedRegionId || !regions) return false;

  const region = regions.find((region) => region.id === selectedRegionId);

  return (
    region?.monitors?.[aclpMonitoringType].includes(featureCapability) ?? false
  );
};
