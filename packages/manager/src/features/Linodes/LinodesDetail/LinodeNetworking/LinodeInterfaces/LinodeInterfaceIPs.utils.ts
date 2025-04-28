import type { LinodeInterface } from '@linode/api-v4';

/**
 * getLinodeInterfaceIPs
 * @returns a string array of IP addresses for display purposes
 */
export function getLinodeInterfaceIPs(linodeInterface: LinodeInterface) {
  if (linodeInterface.vlan && linodeInterface.vlan.ipam_address) {
    return [linodeInterface.vlan.ipam_address];
  }

  const ips: string[] = [];

  if (linodeInterface.public) {
    // IPv4s
    for (const address of linodeInterface.public.ipv4.addresses) {
      if (address.primary) {
        ips.unshift(address.address);
      } else {
        ips.push(address.address);
      }
    }

    // IPv6 Ranges
    for (const address of linodeInterface.public.ipv6.ranges) {
      ips.push(address.range);
    }

    // IPv6 Shared
    for (const address of linodeInterface.public.ipv6.shared) {
      ips.push(address.range);
    }

    // IPv6 SLAAC
    for (const address of linodeInterface.public.ipv6.slaac) {
      ips.push(address.address);
    }
  }

  if (linodeInterface.vpc && linodeInterface.vpc.ipv4) {
    // VPC IPv4s
    for (const address of linodeInterface.vpc.ipv4.addresses) {
      if (address.primary) {
        if (address.nat_1_1_address) {
          ips.unshift(address.nat_1_1_address);
        }
        ips.unshift(address.address);
      } else {
        ips.push(address.address);
        if (address.nat_1_1_address) {
          ips.push(address.nat_1_1_address);
        }
      }
    }

    // VPC IPv4 Ranges
    for (const address of linodeInterface.vpc.ipv4.ranges) {
      ips.push(address.range);
    }
  }

  return ips;
}
