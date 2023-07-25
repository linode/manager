import * as React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';

import type { TableRowErrorProps } from './TableRowError';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<TableRowErrorProps> = {
  render: (args) => {
    const fields = [];
    for (let i = 0; i < args.colSpan; i++) {
      fields.push(<TableCell key={i}>Label {i}</TableCell>);
    }
    return (
      <Table>
        <TableHead>
          <TableRow>{fields}</TableRow>
        </TableHead>
        <TableBody>
          <TableRowError {...args} />
        </TableBody>
      </Table>
    );
  },
};

const meta: Meta<TableRowErrorProps> = {
  args: {
    colSpan: 3,
    message: 'Table data is unavailable.',
  },
  component: TableRowError,
  title: 'Components/Table/TableRowError',
};
export default meta;
