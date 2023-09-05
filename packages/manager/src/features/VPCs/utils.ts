import { Subnet } from '@linode/api-v4/lib/vpcs/types';

export const getUniqueLinodesFromSubnets = (subnets: Subnet[]) => {
  const linodes: number[] = [];
  for (const subnet of subnets) {
    subnet.linodes.forEach((linodeId) => {
      if (!linodes.includes(linodeId)) {
        linodes.push(linodeId);
      }
    });
  }
  return linodes.length;
};
