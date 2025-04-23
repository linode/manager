import { Typography } from '@linode/ui';
import React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import { TableFooter } from './TableFooter';

import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<typeof TableFooter> = {
  args: {
    children: (
      <TableRow>
        <TableCell colSpan={3}>
          <Typography>This is a Table Footer</Typography>
        </TableCell>
      </TableRow>
    ),
  },
  render: (args) => {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Label 1</TableCell>
            <TableCell>Label 2</TableCell>
            <TableCell>Label 3</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Test 1</TableCell>
            <TableCell>Test 2</TableCell>
            <TableCell>Test 3</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter {...args} />
      </Table>
    );
  },
};

const meta: Meta<typeof TableFooter> = {
  component: TableFooter,
  title: 'Components/Table/TableFooter',
};

export default meta;
