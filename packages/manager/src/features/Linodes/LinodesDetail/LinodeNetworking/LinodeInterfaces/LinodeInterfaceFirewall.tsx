import { useLinodeInterfaceFirewallsQuery } from '@linode/queries';
import React from 'react';

import { Link } from 'src/components/Link';
import { Skeleton } from 'src/components/Skeleton';

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

  // display the enabled firewall if it exists, otherwise display the first firewall
  const firewall =
    data.data.find((firewall) => firewall.status === 'enabled') ?? data.data[0];

  return <Link to={`/firewalls/${firewall.id}`}>{firewall.label}</Link>;
};
