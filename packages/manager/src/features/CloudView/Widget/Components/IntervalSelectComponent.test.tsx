import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { IntervalSelectComponent } from './IntervalSelectComponent';

describe('Interval select component', () => {
  const intervalSelectionChange = (selectedInterval) => {};

  it('should check for the selected value in interval select dropdown', () => {
    const scrape_interval = '30s';
    const default_interval = { unit: 'min', value: 5 };

    const { getByRole } = renderWithTheme(
      <IntervalSelectComponent
        default_interval={default_interval}
        onIntervalChange={intervalSelectionChange}
        scrape_interval={scrape_interval}
      />
    );

    const dropdown = getByRole('combobox');

    expect(dropdown.value).equals('5 min');
  });

  it('should show a warning if default interval is not present in available intervals', () => {
    //also checks the working of scrape interval logic
    const scrape_interval = '2m';
    const default_interval = { unit: 'min', value: 1 };

    const { getByText } = renderWithTheme(
      <IntervalSelectComponent
        default_interval={default_interval}
        onIntervalChange={intervalSelectionChange}
        scrape_interval={scrape_interval}
      />
    );

    expect(
      getByText(`Invalid interval '${default_interval?.unit + String(default_interval?.value)}'`)
    ).toBeInTheDocument();
  });
});
