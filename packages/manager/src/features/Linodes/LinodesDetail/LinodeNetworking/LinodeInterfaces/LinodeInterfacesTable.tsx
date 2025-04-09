import React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import { LinodeInterfacesTableContent } from './LinodeInterfacesTableContent';

interface Props {
  linodeId: number;
}

export const LinodeInterfacesTable = ({ linodeId }: Props) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>MAC Address</TableCell>
          <TableCell>Version</TableCell>
          <TableCell>Firewall</TableCell>
          <TableCell>Updated</TableCell>
          <TableCell>Created</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        <LinodeInterfacesTableContent linodeId={linodeId} />
      </TableBody>
    </Table>
  );
};
