import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { wrapWithTableBody } from 'src/utilities/testHelpers';

import { TableCell } from '../TableCell';
import { SelectableTableRow } from './SelectableTableRow';

const cells = [
  { id: 1, label: 'child-cell-1' },
  { id: 2, label: 'child-cell-2' },
  { id: 3, label: 'child-cell-3' },
];

const defaultArgs = {
  children: cells.map((cell) => (
    <TableCell key={cell.id}>{cell.label}</TableCell>
  )),
  handleToggleCheck: vi.fn(),
  isChecked: false,
};

const ariaLabel = 'Select all entities on page';

describe('SelectableTableRow', () => {
  it('should render table row with checkbox and child content', () => {
    const { getAllByText, getByRole, getByText } = render(
      wrapWithTableBody(<SelectableTableRow {...defaultArgs} />)
    );

    const checkbox = getByRole('checkbox', {
      name: ariaLabel,
    });

    expect(checkbox).toBeInTheDocument();

    cells.forEach((cell) => {
      expect(getByText(cell.label)).toBeInTheDocument();
    });

    expect(getAllByText(/child-cell-/i)).toHaveLength(cells.length);
  });

  it('should call handleToggleCheck on click', () => {
    const { getByRole } = render(
      wrapWithTableBody(<SelectableTableRow {...defaultArgs} />)
    );

    const checkbox = getByRole('checkbox', {
      name: ariaLabel,
    });

    fireEvent.click(checkbox);
    expect(defaultArgs.handleToggleCheck).toHaveBeenCalled();
  });

  it('should show checked checkbox correctly if checked', () => {
    const { getByRole } = render(
      wrapWithTableBody(
        <SelectableTableRow {...defaultArgs} isChecked={true} />
      )
    );

    const checkbox = getByRole('checkbox', {
      name: ariaLabel,
    });

    expect(checkbox).toBeChecked();
  });

  it('should show unchecked checkbox correctly if unchecked', () => {
    const { getByRole } = render(
      wrapWithTableBody(<SelectableTableRow {...defaultArgs} />)
    );

    const checkbox = getByRole('checkbox', {
      name: ariaLabel,
    });

    expect(checkbox).not.toBeChecked();
  });
});
