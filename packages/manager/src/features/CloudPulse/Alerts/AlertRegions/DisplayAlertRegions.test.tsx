import { regionFactory } from '@linode/utilities';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DisplayAlertRegions } from './DisplayAlertRegions';

const regions = regionFactory.buildList(10).map(({ id, label }) => ({
  id,
  label,
  checked: false,
  count: Math.random(),
}));

const handleChange = vi.fn();
const handleSelectAll = vi.fn();

describe('DisplayAlertRegions', () => {
  it('should render the regions table', () => {
    renderWithTheme(
      <DisplayAlertRegions
        handleSelectAll={handleSelectAll}
        handleSelectionChange={handleChange}
        regions={regions}
      />
    );

    const table = screen.getByTestId('region-table');
    expect(table).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(regions.length + 1); // +1 for header row
  });

  it('should display checkbox and label', () => {
    renderWithTheme(
      <DisplayAlertRegions
        handleSelectAll={handleSelectAll}
        handleSelectionChange={handleChange}
        regions={regions}
      />
    );

    const row = screen.getByTestId(`region-row-${regions[0].id}`);

    const rowChildren = within(row);

    expect(rowChildren.getByRole('checkbox')).toBeInTheDocument();
    expect(
      rowChildren.getByText(`${regions[0].label} (${regions[0].id})`)
    ).toBeInTheDocument();
  });

  it('should select checkbox when clicked', async () => {
    renderWithTheme(
      <DisplayAlertRegions
        handleSelectAll={handleSelectAll}
        handleSelectionChange={handleChange}
        regions={regions}
      />
    );
    const row = screen.getByTestId(`region-row-${regions[0].id}`);
    const checkbox = within(row).getByRole('checkbox');
    await userEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(regions[0].id, true);
  });
});
