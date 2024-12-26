import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { wrapWithTableBody } from 'src/utilities/testHelpers';

import { CollapsibleRow } from './CollapsibleRow';
import { tableItems, tableRowItems } from './CollapsibleTable.test';

const defaultArgs = tableItems[0];
const rowLabel = tableRowItems[0].label;
const outerTableCells = tableRowItems[0].outerTableCells;
const innerTableData = tableRowItems[0].innerTable;

describe('CollapsibleRow', () => {
  it('should render CollapsibleRow with label, outer table cells and ArrowRightIcon', () => {
    const { getByRole, getByText } = render(
      wrapWithTableBody(<CollapsibleRow {...defaultArgs} />)
    );

    expect(getByText(rowLabel)).toBeVisible();

    outerTableCells.forEach((cell) => {
      expect(getByText(cell.label)).toBeVisible();
    });

    const button = getByRole('button');
    expect(button).toHaveAttribute('aria-label', `expand ${rowLabel} row`);
  });

  it('should render an Expanded Row with ArowDownIcon when ArrowRightIcon button is clicked', async () => {
    const { getByRole, queryByText } = render(
      wrapWithTableBody(<CollapsibleRow {...defaultArgs} />)
    );

    // Expect no innerTableData to be visible when row is in a Collapsed state.
    innerTableData.headCells.forEach((cell) =>
      expect(queryByText(cell.label)).not.toBeInTheDocument()
    );
    innerTableData.rows.forEach((row) => {
      row.cells.forEach((cell) =>
        expect(queryByText(cell.label)).not.toBeInTheDocument()
      );
    });

    const button = getByRole('button');
    expect(button).toHaveAttribute('aria-label', `expand ${rowLabel} row`);

    if (button) {
      await userEvent.click(button);
    }

    // Expect innerTableData to be visible when row is in an Expanded state.
    innerTableData.headCells.forEach((cell) =>
      expect(queryByText(cell.label)).toBeInTheDocument()
    );
    innerTableData.rows.forEach((row) => {
      row.cells.forEach((cell) =>
        expect(queryByText(cell.label)).toBeInTheDocument()
      );
    });
  });
});
