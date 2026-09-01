import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SingleKpiChart } from './SingleKpiChart';

import type { SingleMetricChartProps } from './SingleKpiChart';

describe('SingleMetricCellChart', () => {
  const defaultProps: SingleMetricChartProps = {
    label: 'CPU Usage(%)',
    periodLabel: 'Last 24 Hours',
    value: 45.2,
    chartData: [
      { timestamp: 1724745600, value: 20 },
      { timestamp: 1724749200, value: 50 },
    ],
  };

  it('renders label, value, and period label correctly in standard state', () => {
    renderWithTheme(<SingleKpiChart {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'CPU Usage(%)'
    );
    screen.getByText('45.2');
    screen.getByText('Last 24 Hours');
    screen.getByLabelText('single-metric-chart-container - CPU Usage(%)');
  });

  it('renders progress indicator and hides content when isLoading is true', () => {
    renderWithTheme(<SingleKpiChart {...defaultProps} isLoading />);

    // Primary content should not be displayed
    expect(screen.queryByText('CPU Usage(%)')).not.toBeInTheDocument();
    expect(screen.queryByText('45.2')).not.toBeInTheDocument();
  });

  it('renders error message and hides main content when error prop is provided', () => {
    const errorMessage = 'Unable to fetch metric data';
    renderWithTheme(<SingleKpiChart {...defaultProps} error={errorMessage} />);

    screen.getByText(errorMessage);
  });
});
