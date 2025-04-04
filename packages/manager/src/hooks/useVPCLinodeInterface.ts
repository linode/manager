import { useLinodeInterfacesQuery, useVPCQuery } from '@linode/queries';

export const useVPCLinodeInterface = (
  linodeId: number,
  enabled: boolean = true
) => {
  const { data: interfaces } = useLinodeInterfacesQuery(linodeId, enabled);

  const vpcInterfaces = interfaces?.interfaces.filter((iface) => iface.vpc);

  // Some Linodes may have multiple VPC Linode interfaces. If so, we want the interface that
  // is a default route (otherwise just get the first one)
  const vpcInterface =
    vpcInterfaces?.find((vpcIface) => vpcIface.default_route.ipv4) ??
    vpcInterfaces?.[0];

  const { data: vpcLinodeIsAssignedTo } = useVPCQuery(
    vpcInterface?.vpc?.vpc_id ?? -1,
    Boolean(vpcInterfaces) && enabled
  );

  // For Linode Interfaces, a VPC only Linode is a VPC interface that is the default route for ipv4
  // but doesn't have a nat_1_1 val
  const isVPCOnlyLinode = Boolean(
    vpcInterface?.default_route.ipv4 &&
      !vpcInterface?.vpc?.ipv4.addresses.some(
        (address) => address.nat_1_1_address
      )
  );

  return {
    isVPCOnlyLinode,
    vpcInterface,
    vpcLinodeIsAssignedTo,
  };
};
