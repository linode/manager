import * as React from 'react';
import { useParams } from 'react-router-dom';

import { LinodeFirewalls } from './LinodeFirewalls/LinodeFirewalls';
import { LinodeIPAddresses } from './LinodeIPAddresses';
import { LinodeNetworkingSummaryPanel } from './NetworkingSummaryPanel/NetworkingSummaryPanel';

export const LinodeStorage = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const linodeID = Number(linodeId);

  return (
    <>
      <LinodeNetworkingSummaryPanel linodeID={linodeID} />
      <LinodeFirewalls linodeID={linodeID} />
      <LinodeIPAddresses linodeID={linodeID} />
    </>
  );
};

export default LinodeStorage;
