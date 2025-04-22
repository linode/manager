import { getPrimaryInterfaceIndex } from '../Linodes/LinodesDetail/LinodeConfigs/utilities';

import type {
  APIError,
  Config,
  CreateLinodeInterfacePayload,
  InterfacePayload,
  LinodeInterface,
  Subnet,
  VPC,
} from '@linode/api-v4';
import type { ExtendedIP } from 'src/utilities/ipUtils';

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
    linodeInterface?.vpc?.ipv4.addresses.some(
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

export const getLinodeInterfacePrimaryIPv4 = (iface: LinodeInterface) =>
  iface.vpc?.ipv4.addresses.find((address) => address.primary)?.address;

export const getLinodeInterfaceRanges = (iface: LinodeInterface) =>
  iface.vpc?.ipv4.ranges.map((range) => range.range);

// TODO: update this when converting to react-hook-form
// gets the VPC Interface payload depending on whether we want a Linode Interface or Config Interface payload
export const getVPCInterfacePayload = (inputs: {
  autoAssignIPv4: boolean;
  chosenIP: string;
  firewallId: null | number;
  ipRanges: ExtendedIP[];
  isLinodeInterface: boolean;
  subnetId: null | number | undefined;
  vpcId: number;
}): CreateLinodeInterfacePayload | InterfacePayload => {
  const {
    firewallId,
    chosenIP,
    ipRanges,
    subnetId,
    isLinodeInterface,
    autoAssignIPv4,
    vpcId,
  } = inputs;
  const filteredIPRanges = ipRanges.filter((ipRange) => ipRange.address !== '');

  if (isLinodeInterface) {
    return {
      firewall_id: firewallId,
      vpc: {
        subnet_id: subnetId ?? -1,
        ipv4: {
          addresses: [
            {
              nat_1_1_address: 'auto', // 'auto' in all cases here to match legacy interface behavior - helps the user towards a functional configuration & hides complexity per stakeholder feedback
              address: !autoAssignIPv4 ? chosenIP : 'auto',
            },
          ],
          ranges: filteredIPRanges.map((ipRange) => {
            return { range: ipRange.address };
          }),
        },
      },
      public: null,
      vlan: null,
      default_route: null,
    };
  }

  return {
    ip_ranges: filteredIPRanges.map((ipRange) => ipRange.address),
    ipam_address: null,
    ipv4: {
      nat_1_1: 'any', // 'any' in all cases here to help the user towards a functional configuration & hide complexity per stakeholder feedback
      vpc: !autoAssignIPv4 ? chosenIP : undefined,
    },
    label: null,
    primary: true,
    purpose: 'vpc',
    subnet_id: subnetId,
    vpc_id: vpcId,
  };
};

// TODO M3-9768: we can do something similar to LinodeCreate and use
// transformLegacyInterfaceErrorsToLinodeInterfaceErrors
// once we switch to react-hook-form (not doing this as part of M3-9250
// due to time constraints). For now, this method essentially does the
// opposite: it transforms LinodeInterface errors to an error format that formik
// recognizes
export const transformLinodeInterfaceErrorsToFormikErrors = (
  errors: APIError[]
): APIError[] => {
  for (const error of errors) {
    if (error.field && error.field.includes('vpc.ipv4.ranges')) {
      if (error.field.match(/vpc.ipv4.ranges\[(\d+)\].range/)) {
        error.field = error.field.replace(
          /vpc.ipv4.ranges\[(\d+)\].range/,
          'ip_ranges[$1]'
        );
      } else {
        error.field = 'ip_ranges';
      }
    }
    if (error.field && error.field.includes('vpc.ipv4.addresses')) {
      error.field = 'ipv4.vpc';
    }
  }

  return errors;
};
