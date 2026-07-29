import { listToItemsByID } from '@linode/queries';

import type { Linode, Subnet, VPCIP } from '@linode/api-v4';

export interface LinodeIPOption {
  /**
   * A private IPv4/ public IPv6 address
   */
  label: string;
  /**
   * The Linode associated with the private IPv4/ public IPv6 address
   */
  linode: Linode;
}

export interface VPCIPOption extends LinodeIPOption {
  /**
   * The Subnet associated with the VPC IPv4 address
   */
  subnet: Subnet;
}

/**
 * Given an array of Linodes, this function returns an array of private
 * IPv4 options intended to be used in a Select component.
 */
export const getPrivateIPOptions = (linodes: Linode[] | undefined) => {
  if (!linodes) {
    return [];
  }

  const options: LinodeIPOption[] = [];

  for (const linode of linodes) {
    for (const ip of linode.ipv4) {
      if (ip.startsWith('192.168.')) {
        options.push({ label: ip, linode });
      }
    }
  }
  return options;
};

export const getVPCIPOptions = (
  vpcIps: undefined | VPCIP[],
  linodes: Linode[] | undefined,
  subnets: Subnet[] | undefined
) => {
  if (!vpcIps || !subnets) {
    return [];
  }

  const linodesMap = listToItemsByID(linodes ?? [], 'id');
  const subnetsMap = listToItemsByID(subnets ?? [], 'id');

  const options: VPCIPOption[] = [];

  for (const ip of vpcIps) {
    if (!ip.address || !ip.linode_id) {
      continue;
    }

    const subnet = subnetsMap[ip.subnet_id];
    const linode = linodesMap[ip.linode_id];

    if (!linode || !subnet) {
      // Safeguard against linode or subnet being undefined
      continue;
    }

    options.push({
      label: ip.address,
      subnet,
      linode,
    });
  }

  return options;
};

/**
 * Given an array of Linodes, this function returns an array of
 * public IPv6 options intended to be used in a Select component.
 */
export const getIPv6Options = (linodes: Linode[] | undefined) => {
  if (!linodes) {
    return [];
  }

  const options: LinodeIPOption[] = [];

  for (const linode of linodes) {
    if (linode.ipv6) {
      const [address] = linode.ipv6.split('/');
      options.push({ label: address, linode });
    }
  }
  return options;
};
