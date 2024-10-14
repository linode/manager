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
    const { getByTestId, getByText } = render(
      wrapWithTableBody(<CollapsibleRow {...defaultArgs} />)
    );

    expect(getByText(rowLabel)).toBeVisible();

    outerTableCells.forEach((cell) => {
      expect(getByText(cell.label)).toBeVisible();
    });

    expect(getByTestId('KeyboardArrowRightIcon')).toBeInTheDocument();
  });

  it('should render an Expanded Row with ArowDownIcon when ArrowRightIcon button is clicked', async () => {
    const { getByTestId, queryByText } = render(
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

    const arrowRightButton = getByTestId('KeyboardArrowRightIcon').closest(
      'button'
    );

    if (arrowRightButton) {
      await userEvent.click(arrowRightButton);
    }

    expect(getByTestId('KeyboardArrowDownIcon')).toBeInTheDocument();

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
