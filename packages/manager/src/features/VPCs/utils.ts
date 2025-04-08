import { getPrimaryInterfaceIndex } from '../Linodes/LinodesDetail/LinodeConfigs/utilities';

import type { Config, LinodeInterface, Subnet, VPC } from '@linode/api-v4';

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

// Linode Interfaces: show unrecommended notice if (active) VPC interface has an IPv4 nat_1_1 address but isn't the default IPv4 route
export const hasUnrecommendedConfigurationLinodeInterface = (
  linodeInterface: LinodeInterface | undefined,
  isInterfaceActive: boolean
) => {
  return (
    isInterfaceActive &&
    linodeInterface?.vpc?.ipv4?.addresses.some(
      (address) => address.nat_1_1_address
    ) &&
    !linodeInterface?.default_route.ipv4
  );
};

export const hasUnrecommendedConfiguration = (
  config: Config | undefined,
  subnetId: number
) => {
  if (config) {
    const configInterfaces = config.interfaces;

    /*
     If there is a VPC interface marked as active but not primary, we then check if it
     is implicitly the primary interface. If not, then we want to display a message
     re: it not being a recommended configuration.

     Rationale: when the VPC interface is not the primary interface, it can communicate
     to other VMs within the same subnet, but not to VMs in a different subnet
     within the same VPC.
    */

    if (
      configInterfaces?.some((_interface) => _interface.subnet_id === subnetId)
    ) {
      const nonExplicitPrimaryVPCInterfaceIndex = configInterfaces.findIndex(
        (_interface) =>
          _interface.active &&
          _interface.purpose === 'vpc' &&
          !_interface.primary
      );

      const primaryInterfaceIndex = getPrimaryInterfaceIndex(configInterfaces);

      return (
        // if there exists an active VPC interface not explicitly marked as primary,
        nonExplicitPrimaryVPCInterfaceIndex !== -1 && // check if it actually is the (implicit) primary interface
        primaryInterfaceIndex !== nonExplicitPrimaryVPCInterfaceIndex
      );
    }
  }

  return false;
};

// This isn't great but will hopefully improve once we actually support editing VPCs for LKE-E
export const getIsVPCLKEEnterpriseCluster = (vpc: VPC) =>
  /^workload VPC for LKE Enterprise Cluster lke\d+/i.test(vpc.description) &&
  /^lke\d+/i.test(vpc.label);
