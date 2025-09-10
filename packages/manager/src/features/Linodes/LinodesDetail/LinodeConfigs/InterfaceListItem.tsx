import { useVPCQuery } from '@linode/queries';
import React from 'react';

import type { Interface } from '@linode/api-v4/lib/linodes';

interface Props {
  idx: number;
  interfaceEntry: Interface;
}

export const InterfaceListItem = (props: Props) => {
  const { idx, interfaceEntry } = props;
  const { data: vpc } = useVPCQuery(
    interfaceEntry?.vpc_id ?? -1,
    Boolean(interfaceEntry.vpc_id)
  );

  // The order of the config.interfaces array as returned by the API is significant.
  // Index 0 is eth0, index 1 is eth1, index 2 is eth2.
  const interfaceName = `eth${idx}`;

  const getInterfaceLabel = (configInterface: Interface): string => {
    if (configInterface.purpose === 'public') {
      return 'Public Internet';
    }

    const interfaceLabel = configInterface.label;

    if (configInterface.purpose === 'vlan') {
      const ipamAddress = configInterface.ipam_address;
      const hasIPAM = Boolean(ipamAddress);
      return `VLAN: ${interfaceLabel} ${hasIPAM ? `(${ipamAddress})` : ''}`;
    }

    const vpcIpv4 = configInterface.ipv4?.vpc;
    return `VPC: ${vpc?.label} ${vpcIpv4 ? `(${vpcIpv4})` : ''}`;
  };

  return (
    <li data-testid="interface-list-item">
      {interfaceName} – {getInterfaceLabel(interfaceEntry)}
    </li>
  );
};
