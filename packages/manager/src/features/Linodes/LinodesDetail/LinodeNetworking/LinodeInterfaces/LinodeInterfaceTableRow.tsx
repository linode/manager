import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { LinodeInterfaceActionMenu } from './LinodeInterfaceActionMenu';
import { LinodeInterfaceFirewall } from './LinodeInterfaceFirewall';
import { getLinodeInterfaceType } from './utilities';

import type { InterfaceActionHandlers } from './LinodeInterfaceActionMenu';
import type { LinodeInterface } from '@linode/api-v4';

interface Props extends LinodeInterface {
  handlers: InterfaceActionHandlers;
  linodeId: number;
}

export const LinodeInterfaceTableRow = (props: Props) => {
  const {
    created,
    handlers,
    id,
    linodeId,
    mac_address,
    updated,
    version,
  } = props;

  const type = getLinodeInterfaceType(props);

  return (
    <TableRow>
      <TableCell>{id}</TableCell>
      <TableCell>{type}</TableCell>
      <TableCell>{mac_address}</TableCell>
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
