import * as React from 'react';
import { useParams } from 'react-router-dom';

import { LinodeFirewalls } from './LinodeFirewalls/LinodeFirewalls';
import { LinodeIPAddresses } from './LinodeIPAddresses';
import { LinodeNetworkingSummaryPanel } from './NetworkingSummaryPanel/NetworkingSummaryPanel';

export const LinodeStorage = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const _linodeId = Number(linodeId);

  return (
    <>
      <LinodeNetworkingSummaryPanel linodeId={_linodeId} />
      <LinodeFirewalls linodeID={_linodeId} />
      <LinodeIPAddresses linodeID={_linodeId} />
    </>
  );
};

export default LinodeStorage;
