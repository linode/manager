import * as React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import type { TableRowLoadingProps } from './TableRowLoading';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<TableRowLoadingProps> = {
  render: (args) => {
    const headers = [];
    const columns = args.columns || 4;
    const unit = 100 / columns;
    for (let i = 0; i < columns; i++) {
      headers.push(
        <TableCell key={i} style={{ width: `${unit}%` }}>
          Label {i}
        </TableCell>
      );
    }
    return (
      <Table>
        <TableHead>
          <TableRow>{headers}</TableRow>
        </TableHead>
        <TableBody>
          <TableRowLoading {...args} />
        </TableBody>
      </Table>
    );
  },
};

const meta: Meta<TableRowLoadingProps> = {
  args: {
    columns: 4,
    rows: 1,
  },
  component: TableRowLoading,
  title: 'Components/Table/TableRowLoading',
};
export default meta;
