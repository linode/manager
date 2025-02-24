import React from 'react';

import { Skeleton } from 'src/components/Skeleton';
import { useLinodeInterfaceFirewallsQuery } from 'src/queries/linodes/interfaces';

interface Props {
  interfaceId: number;
  linodeId: number;
}

export const LinodeInterfaceFirewall = ({ interfaceId, linodeId }: Props) => {
  const { data, error, isPending } = useLinodeInterfaceFirewallsQuery(
    linodeId,
    interfaceId
  );

  if (isPending) {
    return <Skeleton />;
  }

  if (error) {
    return 'Unknown';
  }

  if (data.results === 0) {
    return 'None';
  }

  const firewall = data.data[0];

  return firewall.label;
};
