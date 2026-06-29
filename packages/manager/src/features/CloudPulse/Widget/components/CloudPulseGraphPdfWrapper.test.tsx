import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseGraphPdfWrapper } from './CloudPulseGraphPdfWrapper';

// 1. Define a mock method prefixed with the word "mock" so Vitest allows hoisting
const mockSetDashboardPdfData = vi.fn();

// 2. Mock the context hook at the top level
vi.mock('../../Context/useCloudPulseContext', () => ({
  useCloudPulseContext: () => ({
    setDashboardPdfData: mockSetDashboardPdfData,
  }),
}));

// Mock requestAnimationFrame to run immediately
vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
  callback(0)
);

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

const zoomResetKey = 'test-zoom';

describe('CloudPulseGraphPdfWrapper', () => {
  const widgetLabel = 'CPU Utilization';

  it('should render the chart and call the set dashboard pdf data with correct values', () => {
    const { getByTestId } = renderWithTheme(
      <CloudPulseGraphPdfWrapper
        {...mockData}
        data={mockData.data}
        filterString="some-filter-string"
        hiddenLegendRows={['system_cpu_utilization_percent']}
        legendRows={[
          {
            legendTitle: 'CPU Utilization (%)',
            legendColor: 'red',
            data: {
              average: 15,
              max: 20,
              last: 10,
              length: 30,
              total: 300,
            },
            format: (value: number) => `${value} %`,
          },
        ]}
        loading={true}
        widgetLabel={widgetLabel}
        widgetLabelWithUnit="CPU Utilization (%)"
        zoomRange={{ left: 1672531200000, right: 1672617600000 }}
        zoomResetKey={zoomResetKey}
      />
    );
    const graph = getByTestId('cloud-pulse-graph-pdf-wrapper');
    expect(graph).toBeInTheDocument();

    expect(mockSetDashboardPdfData).toHaveBeenCalledWith(
      expect.objectContaining({
        hiddenLegendRows: ['system_cpu_utilization_percent'],
        widgetLabelWithUnit: 'CPU Utilization (%)',
        loading: true,
      })
    );
  });
  it('should handle false/undefined loading states and default to empty hiddenLegendRows array', () => {
    const { getByTestId } = renderWithTheme(
      <CloudPulseGraphPdfWrapper
        {...mockData}
        filterString="default-filter-string"
        // Intentionally leaving out hiddenLegendRows and loading to test fallback logic
        widgetLabel={widgetLabel}
        widgetLabelWithUnit="CPU Utilization (%)"
        zoomResetKey={zoomResetKey}
      />
    );

    const graph = getByTestId('cloud-pulse-graph-pdf-wrapper');
    expect(graph).toBeInTheDocument();

    expect(mockSetDashboardPdfData).toHaveBeenCalledWith(
      expect.objectContaining({
        filterString: 'default-filter-string',
        widgetLabel: 'CPU Utilization',
        loading: false, // Verifies fallback mapping works (loading ?? false)
        hiddenLegendRows: [], // Verifies fallback mapping works (hiddenLegendRows ?? [])
      })
    );
  });
});
