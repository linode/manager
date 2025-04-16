import { useLinodeInterfacesQuery, useVPCQuery } from '@linode/queries';

import { useVPCConfigInterface } from './useVPCConfigInterface';

/**
 * Returns the VPC Interface and VPC the Linode with the given ID is assigned to. Determines
 * whether to use config profile related queries or Linode Interface related queries
 * based on the types of interfaces this Linode is using
 */
export const useVPCInterface = (inputs: {
  isLinodeInterface: boolean;
  linodeId: number;
}) => {
  const { isLinodeInterface, linodeId } = inputs;

  const {
    isVPCOnlyLinodeInterface,
    linodeInterfaceWithVPC,
    vpcLinodeIsAssignedTo: vpcLinodeIsAssignedToInterface,
  } = useVPCLinodeInterface(linodeId, isLinodeInterface);
  const {
    configInterfaceWithVPC,
    configs,
    isVPCOnlyLinode: isVPCOnlyLinodeConfig,
    vpcLinodeIsAssignedTo: vpcLinodeIsAssignedToConfig,
  } = useVPCConfigInterface(linodeId, !isLinodeInterface);

  const isVPCOnlyLinode = isVPCOnlyLinodeConfig || isVPCOnlyLinodeInterface;
  const vpcLinodeIsAssignedTo =
    vpcLinodeIsAssignedToConfig ?? vpcLinodeIsAssignedToInterface;

  return {
    configs, // undefined if this Linode is using Linode Interfaces
    interfaceWithVPC: linodeInterfaceWithVPC ?? configInterfaceWithVPC,
    isVPCOnlyLinode,
    vpcLinodeIsAssignedTo,
  };
};

/**
 * Linode Interface equivalent to useVPCConfigInterface
 * Returns the active VPC Linode interface (an VPC interface that is the default route for IPv4),
 * the VPC of that interface, and if this Linode is a VPC only Linode
 */
export const useVPCLinodeInterface = (
  linodeId: number,
  enabled: boolean = true
) => {
  const { data: interfaces } = useLinodeInterfacesQuery(linodeId, enabled);

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
      !linodeInterfaceWithVPC?.vpc?.ipv4.addresses.some(
        (address) => address.nat_1_1_address
      )
  );

  return {
    isVPCOnlyLinodeInterface,
    linodeInterfaceWithVPC,
    vpcLinodeIsAssignedTo,
  };
};
