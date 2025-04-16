import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { LinodeInterfaceActionMenu } from './LinodeInterfaceActionMenu';
import { LinodeInterfaceFirewall } from './LinodeInterfaceFirewall';
import { LinodeInterfaceIPs } from './LinodeInterfaceIPs';
import { getLinodeInterfaceType } from './utilities';

import type { InterfaceActionHandlers } from './LinodeInterfaceActionMenu';
import type { LinodeInterface } from '@linode/api-v4';

interface Props extends LinodeInterface {
  handlers: InterfaceActionHandlers;
  linodeId: number;
}

export const LinodeInterfaceTableRow = (props: Props) => {
  const { created, handlers, id, linodeId, mac_address, updated, version } =
    props;

  const type = getLinodeInterfaceType(props);

  return (
    <TableRow>
      <TableCell>{type}</TableCell>
      <TableCell>{id}</TableCell>
      <TableCell>
        <MaskableText isToggleable text={mac_address} />
      </TableCell>
      <TableCell>
        <LinodeInterfaceIPs linodeInterface={props} />
      </TableCell>
      <TableCell>{version}</TableCell>
      <TableCell>
        <LinodeInterfaceFirewall interfaceId={id} linodeId={linodeId} />
      </TableCell>
      <TableCell>
        <DateTimeDisplay value={updated} />
      </TableCell>
      <TableCell>
        <DateTimeDisplay value={created} />
      </TableCell>
      <TableCell actionCell>
        <LinodeInterfaceActionMenu handlers={handlers} id={id} type={type} />
      </TableCell>
    </TableRow>
  );
};
