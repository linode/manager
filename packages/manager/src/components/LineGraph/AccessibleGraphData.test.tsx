import { render } from '@testing-library/react';
import React from 'react';

import AccessibleGraphData from './AccessibleGraphData';

import type { GraphTabledDataProps } from './AccessibleGraphData';

const chartInstance = {
  config: {
    data: {
      datasets: [
        {
          data: [
            { t: 1631026800000, y: 10 },
            { t: 1631030400000, y: 20 },
            { t: 1631034000000, y: 30 },
          ],
          label: 'Dataset 1',
        },
        {
          data: [
            { t: 1631026800000, y: 5 },
            { t: 1631030400000, y: 15 },
            { t: 1631034000000, y: 25 },
          ],
          label: 'Dataset 2',
        },
      ],
    },
  },
};

describe('AccessibleGraphData', () => {
  it('renders a table with correct data', () => {
    const { getAllByRole } = render(
      <AccessibleGraphData
        accessibleUnit="%"
        ariaLabel="data filter"
        chartInstance={chartInstance as GraphTabledDataProps['chartInstance']}
        hiddenDatasets={[]}
      />
    );

    // Check that the component renders
    const table = getAllByRole('table')[0];
    expect(table).toBeInTheDocument();

    // Check that the correct number of tables are rendered
    const tables = getAllByRole('table');
    expect(tables.length).toEqual(2);

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
      const value: any =
        chartInstance.config.data.datasets[0].data[idx].y.toFixed(2);

      expect(row.querySelector('td:nth-child(2)')).toHaveTextContent(
        value + '%'
      );
    });
  });

  it('hides the correct datasets', () => {
    const { getByRole, queryByText } = render(
      <AccessibleGraphData
        accessibleUnit="%"
        chartInstance={chartInstance as GraphTabledDataProps['chartInstance']}
        hiddenDatasets={[0]}
      />
    );

    // Check that the first table is hidden
    expect(getByRole('table', { hidden: true })).toBeInTheDocument();
    expect(getByRole('table', { hidden: false })).toBeInTheDocument();

    // Check that the hidden table is not visible
    expect(queryByText('Dataset 1')).not.toBeInTheDocument();
  });
});
