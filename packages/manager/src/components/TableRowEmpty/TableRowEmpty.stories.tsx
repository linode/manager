import * as React from 'react';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import type { Meta, StoryObj } from '@storybook/react';
import type { TableRowEmptyProps } from './TableRowEmpty';

export const Default: StoryObj<TableRowEmptyProps> = {
  render: (args) => {
    const fields = [];
    for (let i = 0; i < args.colSpan; i++) {
      fields.push(<TableCell>Label {i}</TableCell>);
    }
    return (
      <Table>
        <TableHead>
          <TableRow>{fields}</TableRow>
        </TableHead>
        <TableBody>
          <TableRowEmpty {...args} />
        </TableBody>
      </Table>
    );
  },
};

const meta: Meta<TableRowEmptyProps> = {
  title: 'Components/Table/TableRowEmpty',
  component: TableRowEmpty,
  args: {
    colSpan: 3,
    message: 'No items to display.',
  },
};
export default meta;
