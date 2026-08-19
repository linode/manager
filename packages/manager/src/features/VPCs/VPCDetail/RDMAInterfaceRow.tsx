import { TableCell, TableRow } from '@akamai/cds-components/react';
import * as React from 'react';

import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { getLinodeInterfaceIPs } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeInterfaces/LinodeInterfaceIPs.utils';

import { useBreakpoint } from '../hooks/useBreakpoint';

import type { LinodeInterface } from '@linode/api-v4';

interface Props {
  networkInterface: LinodeInterface;
}

export const RDMAInterfaceRow = (props: Props) => {
  const { networkInterface } = props;
  const { id, mac_address } = networkInterface;
  const showFromSmUp = useBreakpoint('up', 'sm');

  const [primaryIPv4] = getLinodeInterfaceIPs(networkInterface);

  return (
    <TableRow zebra>
      <TableCell>{id}</TableCell>
      {showFromSmUp && (
        <TableCell>
          <MaskableText isToggleable text={mac_address} />
        </TableCell>
      )}
      <TableCell>{primaryIPv4 ?? '—'}</TableCell>
    </TableRow>
  );
};
