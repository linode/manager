import { Hidden } from '@linode/ui';
import React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import { LinodeInterfacesTableContent } from './LinodeInterfacesTableContent';

import type { InterfaceActionHandlers } from './LinodeInterfaceActionMenu';

interface Props {
  handlers: InterfaceActionHandlers;
  linodeId: number;
}

export const LinodeInterfacesTable = ({ handlers, linodeId }: Props) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Type</TableCell>
          <TableCell>ID</TableCell>
          <Hidden smDown>
            <TableCell>MAC Address</TableCell>
          </Hidden>
          <TableCell>IP Addresses</TableCell>
          <Hidden lgDown>
            <TableCell>Version</TableCell>
          </Hidden>
          <TableCell>Firewall</TableCell>
          <Hidden mdDown>
            <TableCell>Updated</TableCell>
          </Hidden>
          <Hidden smDown>
            <TableCell>Created</TableCell>
          </Hidden>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        <LinodeInterfacesTableContent handlers={handlers} linodeId={linodeId} />
      </TableBody>
    </Table>
  );
};
