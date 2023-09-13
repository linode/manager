import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import * as React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';

import { CollapsibleRow } from './CollapsibleRow';

export interface TableItem {
  InnerTable: JSX.Element;
  OuterTableCells: JSX.Element;
  id: number;
  label: string;
}

interface Props {
  TableItems: TableItem[];
  TableRowEmpty: JSX.Element;
  TableRowHead: JSX.Element;
}

export const CollapsibleTable = (props: Props) => {
  const { TableItems, TableRowEmpty, TableRowHead } = props;

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>{TableRowHead}</TableHead>
        <TableBody>
          {TableItems.length === 0 && TableRowEmpty}
          {TableItems.map((item) => {
            return (
              <CollapsibleRow
                InnerTable={item.InnerTable}
                OuterTableCells={item.OuterTableCells}
                key={item.id}
                label={item.label}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
