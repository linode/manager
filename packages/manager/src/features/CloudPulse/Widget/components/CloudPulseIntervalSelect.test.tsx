import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseIntervalSelect } from './CloudPulseIntervalSelect';

describe('Interval select component', () => {
  it('should check for the selected value in interval select dropdown', () => {
    const scrape_interval = '30s';
    const default_interval = { unit: 'min', value: 5 };

    const { getByRole, getByTestId } = renderWithTheme(
      <CloudPulseIntervalSelect
        defaultInterval={default_interval}
        onIntervalChange={vi.fn()}
        scrapeInterval={scrape_interval}
      />
    );

    const dropdown = getByRole('combobox');

    expect(dropdown).toHaveAttribute('value', '5 min');

    expect(getByTestId('Data aggregation interval')).toBeInTheDocument(); // test id for tooltip
  });
});
