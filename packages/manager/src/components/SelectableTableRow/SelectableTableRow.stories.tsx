import React, { useState } from 'react';

import { Table } from '../Table';
import { TableBody } from '../TableBody';
import { TableCell } from '../TableCell';
import { TableHead } from '../TableHead';
import { TableRow } from '../TableRow';
import { SelectableTableRow } from './SelectableTableRow';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof SelectableTableRow>;

const headers = [
  { id: 1, label: '' },
  { id: 2, label: 'Label-1' },
  { id: 3, label: 'Label-2' },
  { id: 4, label: 'Label-3' },
];

const cells = [
  { id: 5, label: 'child-cell-1' },
  { id: 6, label: 'child-cell-2' },
  { id: 7, label: 'child-cell-3' },
];

const meta: Meta<typeof SelectableTableRow> = {
  component: SelectableTableRow,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ margin: '2em' }}>
        <Story />
      </div>
    ),
  ],
  title: 'Components/Table/SelectableTableRow',
};

export default meta;

export const Default: Story = {
  args: {
    isChecked: false,
  },
  render: (args) => {
    const SelectableTableRowWrapper = () => {
      const [checked, setChecked] = useState(args.isChecked);

      return (
        <SelectableTableRow
          handleToggleCheck={() => setChecked(!checked)}
          isChecked={checked}
        >
          {cells.map((cell) => (
            <TableCell key={cell.id}>{cell.label}</TableCell>
          ))}
        </SelectableTableRow>
      );
    };

    return (
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header.id}>{header.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <SelectableTableRowWrapper />
        </TableBody>
      </Table>
    );
  },
};

export const Checked: Story = {
  args: {
    isChecked: true,
  },
  render: Default.render,
};
