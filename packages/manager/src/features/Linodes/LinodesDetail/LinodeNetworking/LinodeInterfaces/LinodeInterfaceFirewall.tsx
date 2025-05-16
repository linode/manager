import { useLinodeInterfaceFirewallsQuery } from '@linode/queries';
import { Stack } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';
import { ShowMore } from 'src/components/ShowMore/ShowMore';
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
  const displayedFirewall =
    data.data.find((firewall) => firewall.status === 'enabled') ?? data.data[0];

  const firewalls = data.data.filter(
    (firewall) => firewall.id !== displayedFirewall.id
  );

  return (
    <Stack alignItems={'center'} direction="row" spacing={1.5}>
      <Link to={`/firewalls/${displayedFirewall.id}`}>
        {displayedFirewall.label}
      </Link>
      {firewalls.length > 0 && (
        <ShowMore
          ariaItemType="Interface Firewalls"
          items={firewalls}
          render={(firewalls) => (
            <Stack>
              {firewalls.map((firewall) => (
                <Link key={firewall.id} to={`/firewalls/${firewall.id}`}>
                  {firewall.label}
                </Link>
              ))}
            </Stack>
          )}
        />
      )}
    </Stack>
  );
};
