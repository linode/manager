import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseIntervalSelect } from './CloudPulseIntervalSelect';

import type { TimeGranularity } from '@linode/api-v4';

describe('Interval select component', () => {
  const intervalSelectionChange = (_selectedInterval: TimeGranularity) => { };

  it('should check for the selected value in interval select dropdown', () => {
    const scrape_interval = '30s';
    const default_interval = { unit: 'min', value: 5 };

    const { getByRole, getByTestId } = renderWithTheme(
      <CloudPulseIntervalSelect
        defaultInterval={default_interval}
        onIntervalChange={intervalSelectionChange}
        scrapeInterval={scrape_interval}
      />
    );

    const dropdown = getByRole('combobox');

    expect(dropdown).toHaveAttribute('value', '5 min');

    expect(getByTestId('Data aggregation interval')).toBeInTheDocument(); // test id for tooltip
  });
});
