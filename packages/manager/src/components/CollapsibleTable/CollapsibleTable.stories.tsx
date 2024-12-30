import React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import { CollapsibleTable } from './CollapsibleTable';

import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<typeof CollapsibleTable> = {
  args: {
    TableItems: [
      {
        InnerTable: (
          <Table aria-label="Linode" size="small">
            <TableHead style={{ fontSize: '.875rem' }}>
              <TableRow>
                <TableCell style={{ paddingLeft: 48 }} sx={{ width: '24%' }}>
                  Date
                </TableCell>
                <TableCell sx={{ width: '14%' }}>Customer</TableCell>
                <TableCell sx={{ width: '10%' }}>Amount</TableCell>
                <TableCell sx={{ width: '20%' }}>Total price ($)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell style={{ paddingLeft: 48 }}>2020-01-05</TableCell>
                <TableCell>11091700</TableCell>
                <TableCell>3</TableCell>
                <TableCell>11.97</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingLeft: 48 }}>2020-01-02</TableCell>
                <TableCell>Anonymous</TableCell>
                <TableCell>1</TableCell>
                <TableCell>3.99</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ),
        OuterTableCells: (
          <>
            <TableCell>159</TableCell>
            <TableCell>6</TableCell>
            <TableCell>24</TableCell>
            <TableCell />
          </>
        ),
        id: 1,
        label: 'Frozen Yoghurt',
      },
    ],
    TableRowHead: (
      <TableRow>
        <TableCell sx={{ width: '24%' }}>Dessert (100g serving)</TableCell>
        <TableCell sx={{ width: '14%' }}>Calories</TableCell>
        <TableCell sx={{ width: '18%' }}>Fat (g)</TableCell>
        <TableCell sx={{ width: '10%' }}>Carbs (g) </TableCell>
        <TableCell />
      </TableRow>
    ),
  },
  render: (args) => {
    return <CollapsibleTable {...args} />;
  },
};

const meta: Meta<typeof CollapsibleTable> = {
  component: CollapsibleTable,
  title: 'Components/Table/CollapsibleTable',
};

export default meta;
