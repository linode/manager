import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseLineGraph } from './CloudPulseLineGraph';

const mockData = {
  areas: [
    {
      color: 'theme.color.green',
      dataKey: 'system_cpu_utilization_percent',
    },
  ],
  ariaLabel: 'CPU Utilization',
  data: [
    { system_cpu_utilization_percent: 10, timestamp: 1672531200000 },
    { system_cpu_utilization_percent: 20, timestamp: 1672617600000 },
    { system_cpu_utilization_percent: 30, timestamp: 1672704000000 },
  ],
  error: undefined,
  loading: false,
  timezone: 'UTC',
  unit: '%',
  xAxis: {
    tickFormat: 'HH:mm',
    tickGap: 50,
  },
};

class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

describe('CloudPulseLineGraph', () => {
  window.ResizeObserver = ResizeObserver;

  it('should render AreaChart when data is provided', () => {
    const { container, getByRole } = renderWithTheme(
      <CloudPulseLineGraph {...mockData} />
    );
    const table = getByRole('table');

    expect(
      container.querySelector('.recharts-responsive-container')
    ).toBeInTheDocument();
    expect(table).toHaveAttribute(
      'summary',
      'This table contains the data for the CPU Utilization (system_cpu_utilization_percent)'
    );
  });

  it('should show error state', () => {
    const { getByText } = renderWithTheme(
      <CloudPulseLineGraph {...mockData} error="Test error" />
    );

    expect(getByText('Test error')).toBeInTheDocument();
  });

  it('should show no data message when data array is empty', () => {
    const emptyData = {
      ...mockData,
      data: [],
    };

    const { getByText } = renderWithTheme(
      <CloudPulseLineGraph {...emptyData} />
    );

    expect(getByText('No data to display')).toBeInTheDocument();
  });
});
