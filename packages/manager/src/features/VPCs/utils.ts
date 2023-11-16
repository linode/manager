import type { Config, Subnet } from '@linode/api-v4';

export const getUniqueLinodesFromSubnets = (subnets: Subnet[]) => {
  const linodes: number[] = [];
  for (const subnet of subnets) {
    subnet.linodes.forEach((linodeInfo) => {
      if (!linodes.includes(linodeInfo.id)) {
        linodes.push(linodeInfo.id);
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

export const hasUnrecommendedConfiguration = (configs: Config[]) => {
  for (const config of configs) {
    const configInterfaces = config.interfaces;

    /*
     If there is a VPC interface marked as active but not primary, we want to display a
     message re: it not being a recommended configuration.

     Rationale: when the VPC interface is not the primary interface, it can communicate
     to other VMs within the same subnet, but not to VMs in a different subnet
     within the same VPC.
    */
    return configInterfaces.some(
      (_interface) =>
        _interface.active && _interface.purpose === 'vpc' && !_interface.primary
    );
  }

  return false;
};
