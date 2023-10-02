import type { Config, Subnet } from '@linode/api-v4';

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

export const getSubnetInterfaceFromConfigs = (
  configs: Config[],
  subnetId: number
) => {
  for (const config of configs) {
    for (const linodeInterface of config.interfaces) {
      if (linodeInterface.ipv4?.vpc && linodeInterface.subnet_id === subnetId) {
        return linodeInterface;
      }
    }
  }

  return undefined;
};
