import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';
import { useVPCQuery } from 'src/queries/vpcs/vpcs';

import type { Interface } from '@linode/api-v4/lib/linodes/types';

export const useVPCConfigInterface = (linodeId: number) => {
  const { data: configs } = useAllLinodeConfigsQuery(linodeId);
  let configInterfaceWithVPC: Interface | undefined;

  // eslint-disable-next-line no-unused-expressions
  configs?.find((config) => {
    const interfaces = config.interfaces;

    const interfaceWithVPC = interfaces.find(
      (_interface) => _interface.purpose === 'vpc'
    );

    if (interfaceWithVPC) {
      configInterfaceWithVPC = interfaceWithVPC;
    }

    return interfaceWithVPC;
  });

  const { data: vpcLinodeIsAssignedTo } = useVPCQuery(
    configInterfaceWithVPC?.vpc_id ?? -1,
    Boolean(configInterfaceWithVPC)
  );

  // A VPC-only Linode is a Linode that has at least one config interface with primary set to true and purpose vpc and no ipv4.nat_1_1 value
  const isVPCOnlyLinode = Boolean(
    configInterfaceWithVPC?.primary && !configInterfaceWithVPC.ipv4?.nat_1_1
  );

  return {
    configInterfaceWithVPC,
    configs,
    isVPCOnlyLinode,
    vpcLinodeIsAssignedTo,
  };
};
