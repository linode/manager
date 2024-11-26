import { screen } from '@testing-library/react';
import * as React from 'react';

import { MetricsDisplay } from 'src/components/LineGraph/MetricsDisplay';
import { formatPercentage } from 'src/utilities/statMetrics';
import { renderWithTheme } from 'src/utilities/testHelpers';

describe('CPUMetrics', () => {
  const mockMetrics = {
    average: 5.5,
    last: 7.75,
    length: 3,
    max: 10,
    total: 40,
  };

  it('renders a table', () => {
    const { getAllByRole } = renderWithTheme(
      <MetricsDisplay
        rows={[
          {
            data: mockMetrics,
            format: formatPercentage,
            handleLegendClick: vi.fn(),
            legendColor: 'blue',
            legendTitle: 'Legend Title',
          },
        ]}
      />
    );

    expect(getAllByRole('table')).toHaveLength(1);
  });

  it('renders Max, Avg, and Last table headers', () => {
    const { getByText } = renderWithTheme(
      <MetricsDisplay
        rows={[
          {
            data: mockMetrics,
            format: formatPercentage,
            handleLegendClick: vi.fn(),
            legendColor: 'blue',
            legendTitle: 'Legend Title',
          },
        ]}
      />
    );

    for (const section of ['Max', 'Avg', 'Last']) {
      expect(getByText(section)).toBeVisible();
    }
  });

  it('renders the legend title', () => {
    const { getByTestId } = renderWithTheme(
      <MetricsDisplay
        rows={[
          {
            data: mockMetrics,
            format: formatPercentage,
            handleLegendClick: vi.fn(),
            legendColor: 'blue',
            legendTitle: 'Legend Title',
          },
        ]}
      />
    );

    expect(getByTestId('legend-title')).toBeVisible();
    expect(getByTestId('legend-title')).toHaveTextContent('Legend Title');
  });

  it('renders formatted Max, Avg, and Last values in the table body', () => {
    const { getByText } = renderWithTheme(
      <MetricsDisplay
        rows={[
          {
            data: mockMetrics,
            format: formatPercentage,
            handleLegendClick: vi.fn(),
            legendColor: 'blue',
            legendTitle: 'Legend Title',
          },
        ]}
      />
    );

    for (const value of ['10.00 %', '5.50 %', '7.75 %']) {
      expect(getByText(value)).toBeVisible();
    }
  });

  it('renders multiple rows', () => {
    const { getAllByTestId } = renderWithTheme(
      <MetricsDisplay
        rows={[
          {
            data: mockMetrics,
            format: formatPercentage,
            handleLegendClick: vi.fn(),
            legendColor: 'blue',
            legendTitle: 'Legend Title 1',
          },
          {
            data: { average: 90, last: 100, length: 0, max: 80, total: 110 },
            format: formatPercentage,
            handleLegendClick: vi.fn(),
            legendColor: 'red',
            legendTitle: 'Legend Title 2',
          },
        ]}
      />
    );
    expect(getAllByTestId('legend-title')).toHaveLength(2);
  });
});

describe('metrics by section', () => {
  const sampleMetrics = { average: 5, last: 8, length: 10, max: 10, total: 80 };
  const defaultProps = {
    rows: [
      {
        data: sampleMetrics,
        format: (n: number) => n.toString(),
        legendColor: 'blue' as const,
        legendTitle: 'Test Metric',
      },
    ],
  };

  it('renders metric data in correct order and format', () => {
    renderWithTheme(<MetricsDisplay {...defaultProps} />);

    // Check if headers are rendered in correct order
    const headers = screen.getAllByRole('columnheader');
    expect(headers[1]).toHaveTextContent('Max');
    expect(headers[2]).toHaveTextContent('Avg');
    expect(headers[3]).toHaveTextContent('Last');

    // Check if metric values are rendered in correct order
    const cells = screen.getAllByRole('cell');
    expect(cells[1]).toHaveTextContent('10'); // max
    expect(cells[2]).toHaveTextContent('5'); // average
    expect(cells[3]).toHaveTextContent('8'); // last
  });

  it('formats metric values using provided format function', () => {
    const formatFn = (n: number) => `${n}%`;
    renderWithTheme(
      <MetricsDisplay
        rows={[
          {
            ...defaultProps.rows[0],
            format: formatFn,
          },
        ]}
      />
    );

    const cells = screen.getAllByRole('cell');
    expect(cells[1]).toHaveTextContent('10%');
    expect(cells[2]).toHaveTextContent('5%');
    expect(cells[3]).toHaveTextContent('8%');
  });
});
