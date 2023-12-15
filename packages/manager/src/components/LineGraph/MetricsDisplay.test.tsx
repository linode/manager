import * as React from 'react';

import {
  MetricsDisplay,
  metricsBySection,
} from 'src/components/LineGraph/MetricsDisplay';
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
            legendColor: 'blue',
            legendTitle: 'Legend Title',
          },
        ]}
      />
    );

    for (const value of ['10.00%', '5.50%', '7.75%']) {
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
            legendColor: 'blue',
            legendTitle: 'Legend Title 1',
          },
          {
            data: { average: 90, last: 100, length: 0, max: 80, total: 110 },
            format: formatPercentage,
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
  it('returns expected metric data', () => {
    const metrics = { average: 5, last: 8, length: 10, max: 10, total: 80 };
    expect(metricsBySection(metrics)).toHaveLength(3);
    expect(metricsBySection(metrics)).toBeInstanceOf(Array);
    expect(metricsBySection(metrics)[0]).toEqual(metrics.max);
    expect(metricsBySection(metrics)[1]).toEqual(metrics.average);
    expect(metricsBySection(metrics)[2]).toEqual(metrics.last);
  });
});
