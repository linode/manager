import type { LinodeInterface } from '@linode/api-v4';

export function getLinodeInterfaceIPs(linodeInterface: LinodeInterface) {
  if (linodeInterface.vlan && linodeInterface.vlan.ipam_address) {
    return [`${linodeInterface.vlan.ipam_address} (IPAM)`];
  }

  const ips: string[] = [];

  if (linodeInterface.public) {
    // IPv4s
    for (const address of linodeInterface.public.ipv4.addresses) {
      ips.push(address.address);
    }

    // IPv6 Ranges
    for (const address of linodeInterface.public.ipv6.ranges) {
      ips.push(`${address.range} (Range)`);
    }

    // IPv6 Shared
    for (const address of linodeInterface.public.ipv6.shared) {
      ips.push(`${address.range} (Shared)`);
    }

    // IPv6 SLAAC
    for (const address of linodeInterface.public.ipv6.slaac) {
      ips.push(`${address.address} ${address.prefix} (SLAAC)`);
    }
  }

  if (linodeInterface.vpc) {
    // VPC IPv4s
    for (const address of linodeInterface.vpc.ipv4.addresses) {
      ips.push(address.address);
      if (address.nat_1_1_address) {
        ips.push(`${address.nat_1_1_address} (VPC NAT)`);
      }
    }
    // VPC IPv4 Ranges
    for (const address of linodeInterface.vpc.ipv4.ranges) {
      ips.push(`${address.range} (Range)`);
    }
  }

  return ips;
}
