import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { LinodeInterfaceActionMenu } from './LinodeInterfaceActionMenu';
import { getLinodeInterfaceType } from './utilities';

import type { LinodeInterface } from '@linode/api-v4';

export const LinodeInterfaceTableRow = (props: LinodeInterface) => {
  const { created, id, mac_address, updated, version } = props;

  const type = getLinodeInterfaceType(props);

  return (
    <TableRow>
      <TableCell>{id}</TableCell>
      <TableCell>{type}</TableCell>
      <TableCell>{mac_address}</TableCell>
      <TableCell>{version}</TableCell>
      <TableCell>
        <DateTimeDisplay value={updated} />
      </TableCell>
      <TableCell>
        <DateTimeDisplay value={created} />
      </TableCell>
      <TableCell actionCell>
        <LinodeInterfaceActionMenu id={id} type={type} />
      </TableCell>
    </TableRow>
  );
};
