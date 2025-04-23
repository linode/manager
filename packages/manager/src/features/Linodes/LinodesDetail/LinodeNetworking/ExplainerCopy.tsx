import { useLinodeQuery } from '@linode/queries';
import * as React from 'react';

import { SupportLink } from 'src/components/SupportLink';

import type { IPType } from './AddIPDrawer';

interface ExplainerCopyProps {
  ipType: IPType;
  linodeId: number;
}

export const ExplainerCopy = ({ ipType, linodeId }: ExplainerCopyProps) => {
  const { data: linode } = useLinodeQuery(linodeId);

  switch (ipType) {
    case 'v4Private':
      return (
        <>
          Add a private IP address to your Linode. Data sent explicitly to and
          from private IP addresses in the same data center does not incur
          transfer quota usage. To ensure that the private IP is properly
          configured once added, it&rsquo;s best to reboot your Linode.
        </>
      );
    case 'v4Public':
      return (
        <>
          Public IP addresses, over and above the one included with each Linode,
          incur an additional monthly charge. If you need an additional Public
          IP Address you must request one. Please open a{' '}
          <SupportLink
            entity={{ id: linodeId, type: 'linode_id' }}
            text="Support Ticket"
            title={`Additional Public IP Address on ${linode?.label}`}
          />{' '}
          if you have not done so already.
        </>
      );
    default:
      return null;
  }
};
