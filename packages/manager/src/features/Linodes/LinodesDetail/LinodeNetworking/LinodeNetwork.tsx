import * as React from 'react';
import { useParams } from 'react-router-dom';

import { Stack } from 'src/components/Stack';

import { LinodeFirewalls } from './LinodeFirewalls/LinodeFirewalls';
import { LinodeIPAddresses } from './LinodeIPAddresses';
import { LinodeNetworkingSummaryPanel } from './NetworkingSummaryPanel/NetworkingSummaryPanel';

export const LinodeStorage = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const _linodeId = Number(linodeId);

  return (
    <Stack spacing={2}>
      <LinodeNetworkingSummaryPanel linodeId={_linodeId} />
      <LinodeFirewalls linodeID={_linodeId} />
      <LinodeIPAddresses linodeID={_linodeId} />
    </Stack>
  );
};

export default LinodeStorage;
