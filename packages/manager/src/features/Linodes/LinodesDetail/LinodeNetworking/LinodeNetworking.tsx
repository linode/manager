import { Stack } from '@linode/ui';
import React from 'react';
import { useParams } from 'react-router-dom';

import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { LinodeFirewalls } from './LinodeFirewalls/LinodeFirewalls';
import { LinodeInterfaces } from './LinodeInterfaces/LinodeInterfaces';
import { LinodeIPAddresses } from './LinodeIPAddresses';
import { LinodeNetworkingSummaryPanel } from './NetworkingSummaryPanel/NetworkingSummaryPanel';

export const LinodeNetworking = () => {
  const isLinodeInterfaceEnabled = useIsLinodeInterfacesEnabled();
  const { linodeId } = useParams<{ linodeId: string }>();
  const _linodeId = Number(linodeId);

  return (
    <Stack spacing={2}>
      <LinodeNetworkingSummaryPanel linodeId={_linodeId} />
      {!isLinodeInterfaceEnabled && <LinodeFirewalls linodeID={_linodeId} />}
      {isLinodeInterfaceEnabled && <LinodeInterfaces linodeId={_linodeId} />}
      <LinodeIPAddresses linodeID={_linodeId} />
    </Stack>
  );
};
