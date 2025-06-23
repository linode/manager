import {
  useAllLinodeConfigsQuery,
  useLinodeInterfacesQuery,
  useVPCQuery,
} from '@linode/queries';

import { getPrimaryInterfaceIndex } from 'src/features/Linodes/LinodesDetail/LinodeConfigs/utilities';

import type { Interface } from '@linode/api-v4/lib/linodes/types';

/**
 * Returns outputs that can be used to determine if a Linode's public IPv4 and IPv6 ips are reachable.
 *
 * Returns the VPC Interface and VPC the Linode with the given ID is assigned to. Determines
 * whether to use config profile related queries or Linode Interface related queries
 * based on the types of interfaces this Linode is using
 */
export const useDetermineReachableIPs = (inputs: {
  isLinodeInterface: boolean;
  linodeId: number;
}) => {
  const { isLinodeInterface, linodeId } = inputs;

  const {
    linodeInterfaceWithVPC,
    isUnreachablePublicIPv4LinodeInterface,
    isUnreachablePublicIPv6LinodeInterface,
    vpcLinodeIsAssignedTo: vpcLinodeIsAssignedToInterface,
  } = useDetermineReachableIPsLinodeInterface(linodeId, isLinodeInterface);
  const {
    configInterfaceWithVPC,
    configs,
    isUnreachablePublicIPv6ConfigInterface,
    isUnreachablePublicIPv4ConfigInterface,
    vpcLinodeIsAssignedTo: vpcLinodeIsAssignedToConfig,
  } = useDetermineReachableIPsConfigInterface(linodeId, !isLinodeInterface);

  const isUnreachablePublicIPv4 =
    isUnreachablePublicIPv4ConfigInterface ||
    isUnreachablePublicIPv4LinodeInterface;
  const isUnreachablePublicIPv6 =
    isUnreachablePublicIPv6ConfigInterface ||
    isUnreachablePublicIPv6LinodeInterface;
  const vpcLinodeIsAssignedTo =
    vpcLinodeIsAssignedToConfig ?? vpcLinodeIsAssignedToInterface;

  return {
    configs, // undefined if this Linode is using Linode Interfaces
    interfaceWithVPC: linodeInterfaceWithVPC ?? configInterfaceWithVPC,
    isUnreachablePublicIPv4,
    isUnreachablePublicIPv6,
    vpcLinodeIsAssignedTo,
  };
};

/**
 * Linode Interface equivalent to useDetermineReachableIPsConfigInterface
 * Returns the active VPC Linode interface (an VPC interface that is the default route for IPv4),
 * the VPC of that interface, and if this Linode is a VPC only Linode
 */
export const useDetermineReachableIPsLinodeInterface = (
  linodeId: number,
  enabled: boolean = true
) => {
  const { data: interfaces } = useLinodeInterfacesQuery(linodeId, enabled);

  const hasLinodeInterfaces =
    interfaces?.interfaces && interfaces.interfaces.length > 0;

  const vpcInterfaces = interfaces?.interfaces.filter((iface) => iface.vpc);

  // Some Linodes may have multiple VPC Linode interfaces. If so, we want the interface that
  // is a default route (otherwise just get the first one)
  const linodeInterfaceWithVPC =
    vpcInterfaces?.find((vpcIface) => vpcIface.default_route.ipv4) ??
    vpcInterfaces?.[0];

  const { data: vpcLinodeIsAssignedTo } = useVPCQuery(
    linodeInterfaceWithVPC?.vpc?.vpc_id ?? -1,
    Boolean(vpcInterfaces?.length) && enabled
  );

  // For Linode Interfaces, a VPC only Linode is a VPC interface that is the default route for ipv4
  // but doesn't have a nat_1_1 val
  const isVPCOnlyLinodeInterface = Boolean(
    linodeInterfaceWithVPC?.default_route.ipv4 &&
      !linodeInterfaceWithVPC?.vpc?.ipv4?.addresses.some(
        (address) => address.nat_1_1_address
      )
  );

  // public IPv6 is (currently) not reachable if Linode has no public interfaces
  const isUnreachablePublicIPv6LinodeInterface = !interfaces?.interfaces.some(
    (iface) => iface.public
  );

  const isUnreachablePublicIPv4LinodeInterface =
    isVPCOnlyLinodeInterface ||
    !hasLinodeInterfaces ||
    interfaces?.interfaces.every((iface) => iface.vlan);

  return {
    isUnreachablePublicIPv4LinodeInterface,
    isUnreachablePublicIPv6LinodeInterface,
    linodeInterfaceWithVPC,
    vpcLinodeIsAssignedTo,
  };
};

/**
 *
 */
export const useDetermineReachableIPsConfigInterface = (
  linodeId: number,
  enabled: boolean = true
) => {
  const { data: configs } = useAllLinodeConfigsQuery(linodeId, enabled);
  let configInterfaceWithVPC: Interface | undefined;

  const configWithVPCInterface = configs?.find((config) => {
    const interfaces = config.interfaces;

    const interfaceWithVPC = interfaces?.find(
      (_interface) => _interface.purpose === 'vpc'
    );

    if (interfaceWithVPC) {
      configInterfaceWithVPC = interfaceWithVPC;
    }

    return config;
  });

  const primaryInterfaceIndex = getPrimaryInterfaceIndex(
    configWithVPCInterface?.interfaces ?? []
  );

  const hasConfigInterfaces =
    configWithVPCInterface?.interfaces &&
    configWithVPCInterface?.interfaces.length > 0;

  const vpcInterfaceIndex = configWithVPCInterface?.interfaces?.findIndex(
    (_interface) => _interface.id === configInterfaceWithVPC?.id
  );

  const hasPublicConfigInterface = Boolean(
    configWithVPCInterface?.interfaces?.some(
      (_interface) => _interface.purpose === 'public'
    )
  );

  const { data: vpcLinodeIsAssignedTo } = useVPCQuery(
    configInterfaceWithVPC?.vpc_id ?? -1,
    Boolean(configInterfaceWithVPC) && enabled
  );

  // A VPC-only Linode is a Linode that has at least one primary VPC interface (either explicit or implicit) and purpose vpc and no ipv4.nat_1_1 value
  const isVPCOnlyLinode = Boolean(
    (configInterfaceWithVPC?.primary ||
      primaryInterfaceIndex === vpcInterfaceIndex) &&
      !configInterfaceWithVPC?.ipv4?.nat_1_1
  );

  // For legacy config interfaces, if a Linode has no interfaces, the API automatically provides public connectivity.
  // IPv6 is unreachable if the Linode has interfaces, but none of these interfaces is a public interface
  const isUnreachablePublicIPv6ConfigInterface =
    hasConfigInterfaces && !hasPublicConfigInterface;

  const isUnreachablePublicIPv4ConfigInterface =
    isVPCOnlyLinode ||
    configWithVPCInterface?.interfaces?.every(
      (iface) => iface.purpose === 'vlan'
    );

  return {
    configInterfaceWithVPC,
    configs,
    isUnreachablePublicIPv6ConfigInterface,
    isUnreachablePublicIPv4ConfigInterface,
    vpcLinodeIsAssignedTo,
  };
};
