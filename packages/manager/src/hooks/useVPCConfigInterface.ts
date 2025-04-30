import { useAllLinodeConfigsQuery, useVPCQuery } from '@linode/queries';

import { getPrimaryInterfaceIndex } from 'src/features/Linodes/LinodesDetail/LinodeConfigs/utilities';

import type { Interface } from '@linode/api-v4/lib/linodes/types';

export const useVPCConfigInterface = (
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

  const vpcInterfaceIndex = configWithVPCInterface?.interfaces?.findIndex(
    (_interface) => _interface.id === configInterfaceWithVPC?.id
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

  return {
    configInterfaceWithVPC,
    configs,
    isVPCOnlyLinode,
    vpcLinodeIsAssignedTo,
  };
};
