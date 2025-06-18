import type { Linode, LinodeIPsResponse, Subnet } from '@linode/api-v4';

export interface PrivateIPOption {
  /**
   * A private IPv4 address
   */
  label: string;
  /**
   * The Linode associated with the private IPv4 address
   */
  linode: Partial<Linode>;
}

export interface VPCIPOption extends PrivateIPOption {
  /**
   * The Subnet associated with the VPC IPv4 address
   */
  subnet: Partial<Subnet>;
}

/**
 * Given an array of Linodes, this function returns an array of private
 * IPv4 options intended to be used in a Select component.
 */
export const getPrivateIPOptions = (linodes: Linode[] | undefined) => {
  if (!linodes) {
    return [];
  }

  const options: PrivateIPOption[] = [];

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
  vpcIps: LinodeIPsResponse[] | undefined,
  linodes: Linode[] | undefined,
  subnets?: Subnet[] | undefined
) => {
  if (!vpcIps || !subnets) {
    return [];
  }

  const options: VPCIPOption[] = [];

  const linodeLabelMap = (linodes ?? []).reduce(
    (acc: Record<number, string>, linode) => {
      acc[linode.id] = linode.label;
      return acc;
    },
    {}
  );
  const subnetLabelMap = (subnets ?? []).reduce(
    (acc: Record<number, string>, subnet) => {
      acc[subnet.id] = subnet.label;
      return acc;
    },
    {}
  );

  vpcIps.forEach(({ ipv4 }) => {
    if (ipv4.vpc) {
      const vpcData = ipv4.vpc
        .filter((vpc) => vpc.address && vpc.subnet_id in subnetLabelMap)
        .map((vpc) => {
          const linode: Partial<Linode> = {
            label: linodeLabelMap[vpc.linode_id],
            id: vpc.linode_id,
          };
          return {
            label: vpc.address,
            linode,
            subnet: {
              id: vpc.subnet_id,
              label: subnetLabelMap[vpc.subnet_id],
            },
          };
        });

      if (vpcData) {
        options.push(...vpcData);
      }
    }
  });

  return options.sort((a, b) => a.label.localeCompare(b.label));
};
