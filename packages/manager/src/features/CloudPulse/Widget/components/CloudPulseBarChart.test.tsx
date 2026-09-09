import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseBarChart } from './CloudPulseBarChart';

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

const zoomResetKey = 'test-zoom';

describe('CloudPulseBarChart', () => {
  window.ResizeObserver = ResizeObserver;
  const widgetLabel = 'CPU Utilization';

  it('should render BarChart when data is provided', () => {
    const { container } = renderWithTheme(
      <CloudPulseBarChart
        {...mockData}
        widgetLabel={widgetLabel}
        zoomResetKey={zoomResetKey}
      />
    );

    expect(
      container.querySelector('.recharts-responsive-container')
    ).toBeInTheDocument();
  });

  it('should show error state', () => {
    const { getByText } = renderWithTheme(
      <CloudPulseBarChart
        {...mockData}
        error="Test error"
        widgetLabel={widgetLabel}
        zoomResetKey={zoomResetKey}
      />
    );

    getByText('Test error');
  });

  it('should show no data message when data array is empty', () => {
    const emptyData = {
      ...mockData,
      data: [],
    };

    const { getByText } = renderWithTheme(
      <CloudPulseBarChart
        {...emptyData}
        widgetLabel={widgetLabel}
        zoomResetKey={zoomResetKey}
      />
    );

    getByText('No data to display');
  });
});
