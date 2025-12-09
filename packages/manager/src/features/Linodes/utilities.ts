import type { Interface, LinodeInterface, Subnet } from '@linode/api-v4';

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

export const getSubnetsString = (data: Subnet[]) => {
  const firstThreeSubnets = data.slice(0, 3);
  const subnetLabels = firstThreeSubnets.map((subnet) => subnet.label);
  const firstThreeSubnetsString = subnetLabels.join(', ');

  return data.length > 3
    ? firstThreeSubnetsString.concat(`, plus ${data.length - 3} more.`)
    : firstThreeSubnetsString;
};

export const getVPCIPv4 = (
  interfaceWithVPC: Interface | LinodeInterface | undefined
) => {
  if (interfaceWithVPC) {
    if ('purpose' in interfaceWithVPC) {
      return interfaceWithVPC.ipv4?.vpc;
    }
    return interfaceWithVPC.vpc?.ipv4?.addresses.find(
      (address) => address.primary
    )?.address;
  }

  return undefined;
};

export const getVPCIPv6 = (
  interfaceWithVPC: Interface | LinodeInterface | undefined
) => {
  if (interfaceWithVPC) {
    if ('purpose' in interfaceWithVPC) {
      return interfaceWithVPC.ipv6?.slaac[0]?.address;
    }

    return interfaceWithVPC.vpc?.ipv6?.slaac[0]?.address;
  }

  return undefined;
};
