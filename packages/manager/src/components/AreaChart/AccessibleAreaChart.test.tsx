import { render } from '@testing-library/react';
import React from 'react';

import { AccessibleAreaChart } from './AccessibleAreaChart';

const data1 = [
  { 'Dataset 1': 10, timestamp: 1631026800000 },
  { 'Dataset 1': 20, timestamp: 1631030400000 },
  { 'Dataset 1': 30, timestamp: 1631034000000 },
];

describe('AccessibleAreaChart', () => {
  it('renders a table with correct data', () => {
    const { getAllByRole } = render(
      <AccessibleAreaChart
        ariaLabel="data filter"
        data={data1}
        dataKeys={['Dataset 1']}
        timezone="America/New_York"
        unit="%"
      />
    );

    // Check that the component renders
    const table = getAllByRole('table')[0];
    expect(table).toBeInTheDocument();

    // Check that the table has the correct summary attribute
    expect(table).toHaveAttribute(
      'summary',
      'This table contains the data for the data filter (Dataset 1)'
    );

    // Check that the table header is correct
    const tableHeader = table.querySelector('thead > tr');
    expect(tableHeader).toHaveTextContent('Time');
    expect(tableHeader).toHaveTextContent('Dataset 1');

    // Check that the table data is correct in the body
    const tableBodyRows = table.querySelectorAll('tbody > tr');
    expect(tableBodyRows.length).toEqual(3);

    tableBodyRows.forEach((row, idx) => {
      const value = data1[idx]['Dataset 1'].toFixed(2);

      expect(row.querySelector('td:nth-child(2)')).toHaveTextContent(
        value + '%'
      );
    });
  });
});
