import { isEmpty } from 'ramda';
import * as React from 'react';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { BackupLinodes } from './BackupLinodes';
import { ExtendedLinode } from './types';

interface BackupsTableProps {
  linodes: ExtendedLinode[];
  loading: boolean;
}

export const BackupsTable = (props: BackupsTableProps) => {
  const { linodes, loading } = props;

  return (
    <Table sx={{ width: '100%' }}>
      <TableHead>
        <TableRow>
          <TableCell data-qa-table-header="Label">Label</TableCell>
          <TableCell data-qa-table-header="Plan">Plan</TableCell>
          <TableCell data-qa-table-header="Price">Price</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {loading && isEmpty(linodes) ? (
          <TableRowLoading columns={3} />
        ) : (
          <BackupLinodes linodes={linodes} />
        )}
      </TableBody>
    </Table>
  );
};
