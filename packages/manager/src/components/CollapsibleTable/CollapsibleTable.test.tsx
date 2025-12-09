import React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CollapsibleTable } from './CollapsibleTable';

const tableRowHeadCells = [
  { label: 'Dessert (100g serving)' },
  { label: 'Calories' },
  { label: 'Fat (g)' },
  { label: 'Carbs (g)' },
];

export const tableRowItems = [
  {
    id: 1,
    innerTable: {
      headCells: [
        { label: 'Date' },
        { label: 'Customer' },
        { label: 'Amount' },
        { label: 'Total price ($)' },
      ],
      rows: [
        {
          cells: [
            { label: '2020-01-05' },
            { label: '11091700' },
            { label: '3' },
            { label: '11.97' },
          ],
          id: '1-row-1',
        },
        {
          cells: [
            { label: '2020-01-02' },
            { label: 'Anonymous' },
            { label: '1' },
            { label: '3.99' },
          ],
          id: '1-row-2',
        },
      ],
    },
    label: 'Frozen Yoghurt',
    outerTableCells: [{ label: '159' }, { label: '6' }, { label: '24' }],
  },
  {
    id: 2,
    innerTable: {
      headCells: [
        { label: 'Date' },
        { label: 'Customer' },
        { label: 'Amount' },
        { label: 'Total price ($)' },
      ],
      rows: [
        {
          cells: [
            { label: '2024-09-23' },
            { label: 'Customer-1' },
            { label: '4' },
            { label: '19.96' },
          ],
          id: '2-row-1',
        },
        {
          cells: [
            { label: '2024-09-25' },
            { label: 'Customer-2' },
            { label: '3' },
            { label: '11.97' },
          ],
          id: '2-row-2',
        },
      ],
    },
    label: 'Chocolate Cake',
    outerTableCells: [{ label: '300' }, { label: '12' }, { label: '40' }],
  },
];

const tableRowHead = (
  <TableRow>
    {tableRowHeadCells.map((cell, idx) => (
      <TableCell key={idx}>{cell.label}</TableCell>
    ))}
  </TableRow>
);

export const tableItems = tableRowItems.map((table) => {
  return {
    InnerTable: (
      <Table aria-label={table.label} size="small">
        <TableHead>
          <TableRow>
            {table.innerTable.headCells.map((cell, idx) => (
              <TableCell key={idx}>{cell.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {table.innerTable.rows.map((row) => (
            <TableRow key={row.id}>
              {row.cells.map((cell, idx) => (
                <TableCell key={idx}>{cell.label}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ),
    OuterTableCells: (
      <>
        {table.outerTableCells.map((cell, idx) => (
          <TableCell key={idx}>{cell.label}</TableCell>
        ))}
      </>
    ),
    id: table.id,
    label: table.label,
  };
});

const tableRowEmpty = <TableRowEmpty colSpan={4} />;

const defaultArgs = {
  TableItems: tableItems,
  TableRowEmpty: tableRowEmpty,
  TableRowHead: tableRowHead,
};

describe('CollapsibleTable', () => {
  it('should render CollapsibleTable with tableRowHead and TableItems', () => {
    const { getByText } = renderWithTheme(
      <CollapsibleTable {...defaultArgs} />
    );

    tableRowHeadCells.forEach((cell) =>
      expect(getByText(cell.label)).toBeVisible()
    );

    tableRowItems.forEach((row) => {
      expect(getByText(row.label)).toBeVisible();
      row.outerTableCells.forEach((cell) =>
        expect(getByText(cell.label)).toBeVisible()
      );
    });
  });

  it('should render "No items to display." message when no data is available', () => {
    const { getByText } = renderWithTheme(
      <CollapsibleTable {...defaultArgs} TableItems={[]} />
    );

    expect(getByText('No items to display.')).toBeVisible();
  });
});
