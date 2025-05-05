import { regionFactory } from '@linode/utilities';
import { render, screen, within } from '@testing-library/react';
import React from 'react';

import { DisplayAlertRegions } from './DisplayAlertRegions';

const regions = regionFactory.buildList(10);

describe('DisplayAlertRegions', () => {
  it('should render the regions table', () => {
    render(<DisplayAlertRegions regions={regions} />);

    const table = screen.getByTestId('region-table');
    expect(table).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(regions.length + 1); // +1 for header row
  });

  it('should display checkbox and label', () => {
    render(<DisplayAlertRegions regions={regions} />);

    const row = screen.getByTestId(`region-row-${regions[0].id}`);

    const rowChildren = within(row);

    expect(rowChildren.getByRole('checkbox')).toBeInTheDocument();
    expect(rowChildren.getByText(regions[0].label)).toBeInTheDocument();
  });
});
