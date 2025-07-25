import { useLinodeQuery } from '@linode/queries';
import { CircleProgress, ErrorState, Stack } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { LinodeFirewalls } from './LinodeFirewalls/LinodeFirewalls';
import { LinodeInterfaces } from './LinodeInterfaces/LinodeInterfaces';
import { LinodeIPAddresses } from './LinodeIPAddresses';
import { LinodeNetworkingSummaryPanel } from './NetworkingSummaryPanel/NetworkingSummaryPanel';

export const LinodeNetworking = () => {
  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const id = Number(linodeId);

  const { data: linode, error, isPending } = useLinodeQuery(id);

  if (isPending) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  const showInterfacesTable =
    isLinodeInterfacesEnabled && linode.interface_generation === 'linode';

  const showFirewallsTable =
    !linode.interface_generation ||
    linode.interface_generation === 'legacy_config';

  return (
    <Stack spacing={2}>
      <LinodeNetworkingSummaryPanel linodeId={id} />
      {showFirewallsTable && <LinodeFirewalls linodeID={id} />}
      {showInterfacesTable && (
        <LinodeInterfaces linodeId={id} regionId={linode.region} />
      )}
      <LinodeIPAddresses linodeID={id} />
    </Stack>
  );
};
