import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';
import { useVPCsQuery } from 'src/queries/vpcs';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';

import type { Interface } from '@linode/api-v4/lib/linodes/types';

export const useVPCConfigInterface = (linodeId: number) => {
  const flags = useFlags();
  const { account } = useAccountManagement();

  const displayVPCSection = isFeatureEnabled(
    'VPCs',
    Boolean(flags.vpc),
    account?.capabilities ?? []
  );

  const { data: vpcData } = useVPCsQuery({}, {}, displayVPCSection);
  const vpcsList = vpcData?.data ?? [];

  const vpcLinodeIsAssignedTo = vpcsList.find((vpc) => {
    const subnets = vpc.subnets;

    return Boolean(
      subnets.find((subnet) =>
        subnet.linodes.some((linodeInfo) => linodeInfo.id === linodeId)
      )
    );
  });

  const { data: configs } = useAllLinodeConfigsQuery(linodeId);
  let configInterfaceWithVPC: Interface | undefined;

  // eslint-disable-next-line no-unused-expressions
  configs?.find((config) => {
    const interfaces = config.interfaces;

    const interfaceWithVPC = interfaces.find(
      (_interface) => _interface.vpc_id === vpcLinodeIsAssignedTo?.id
    );

    if (interfaceWithVPC) {
      configInterfaceWithVPC = interfaceWithVPC;
    }

    return interfaceWithVPC;
  });

  // A VPC-only Linode is a Linode that has at least one config interface with primary set to true and purpose vpc and no ipv4.nat_1_1 value
  const isVPCOnlyLinode = Boolean(
    configInterfaceWithVPC?.primary && !configInterfaceWithVPC.ipv4?.nat_1_1
  );

  return {
    configInterfaceWithVPC,
    displayVPCSection,
    isVPCOnlyLinode,
    vpcLinodeIsAssignedTo,
  };
};
