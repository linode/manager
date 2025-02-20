import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import React from 'react';

import {
  cloudPulseMetricsResponseDataFactory,
  widgetFactory,
} from 'src/factories';
import * as CloudPulseWidgetUtils from 'src/features/CloudPulse/Utils/CloudPulseWidgetUtils';
import { formatPercentage } from 'src/utilities/statMetrics';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseWidget } from './CloudPulseWidget';

import type { CloudPulseWidgetProperties } from './CloudPulseWidget';

const props: CloudPulseWidgetProperties = {
  additionalFilters: [],
  ariaLabel: 'CPU Utilization',
  availableMetrics: {
    available_aggregate_functions: ['min', 'max', 'avg'],
    dimensions: [],
    is_alertable: true,
    label: 'CPU utilization',
    metric: 'system_cpu_utilization_percent',
    metric_type: 'gauge',
    scrape_interval: '2m',
    unit: 'percent',
  },
  duration: {
    end: DateTime.now().toISO(),
    preset: '30minutes',
    start: DateTime.now().minus({ minutes: 30 }).toISO(),
  },
  entityIds: ['1', '2'],
  isJweTokenFetching: false,
  resources: [
    {
      id: '1',
      label: 'test-1',
    },
    {
      id: '2',
      label: 'test-2',
    },
  ],
  savePref: true,
  serviceType: 'linode',
  unit: '%',
  widget: widgetFactory.build({
    label: 'CPU Utilization',
  }),
};

const queryMocks = vi.hoisted(() => ({
  useCloudPulseMetricsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudpulse/metrics', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/metrics');
  return {
    ...actual,
    useCloudPulseMetricsQuery: queryMocks.useCloudPulseMetricsQuery,
  };
});

queryMocks.useCloudPulseMetricsQuery.mockReturnValue({
  data: cloudPulseMetricsResponseDataFactory.build(),
  isError: false,
  isLoading: false,
  status: 'success',
});

const mockMetrics = {
  average: 5.5,
  last: 7.75,
  length: 3,
  max: 10,
  total: 40,
};
const graphData = {
  areas: [
    {
      color: '#1CB35C',
      dataKey: 'test-1',
    },
  ],
  dimensions: [],
  legendRowsData: [
    {
      data: mockMetrics,
      format: formatPercentage,
      handleLegendClick: vi.fn(),
      legendColor: 'blue',
      legendTitle: 'Test',
    },
  ],
  unit: '%',
};
vi.spyOn(CloudPulseWidgetUtils, 'generateGraphData').mockReturnValue(graphData);

class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

const mockUpdatePreferences = vi.fn();
vi.mock('../Utils/UserPreference', () => ({
  useAclpPreference: () => ({
    updateWidgetPreference: mockUpdatePreferences,
  }),
}));

describe('Cloud pulse widgets', () => {
  window.ResizeObserver = ResizeObserver;

  it('should render widget with all required components', () => {
    const { container, getByTestId, getByText } = renderWithTheme(
      <CloudPulseWidget {...props} />
    );

    // Verify widget title and unit
    expect(getByText('CPU Utilization (%)')).toBeInTheDocument();

    // Verify interval select
    expect(getByTestId('Data aggregation interval')).toBeInTheDocument();

    // Verify aggregate function select
    expect(getByTestId('Aggregation function')).toBeInTheDocument();

    // Verify zoom icon
    expect(getByTestId('zoom-out')).toBeInTheDocument();

    // Verify graph component
    expect(
      container.querySelector('.recharts-responsive-container')
    ).toBeInTheDocument();
  });

  it('should show error state when metrics fetch fails', () => {
    queryMocks.useCloudPulseMetricsQuery.mockReturnValue({
      data: undefined,
      error: [{ reason: 'test reason' }],
      isLoading: false,
      status: 'error',
    });

    const { getByText } = renderWithTheme(<CloudPulseWidget {...props} />);
    expect(getByText('test reason')).toBeInTheDocument();
  });

  it('should update preferences for zoom toggle', async () => {
    const { getByTestId } = renderWithTheme(<CloudPulseWidget {...props} />);
    const zoomButton = getByTestId('zoom-out');
    await userEvent.click(zoomButton);
    expect(mockUpdatePreferences).toHaveBeenCalledWith('CPU Utilization', {
      size: 6,
    });
  });

  it('should update preferences for aggregation function select', async () => {
    const { getByRole } = renderWithTheme(<CloudPulseWidget {...props} />);

    await userEvent.click(
      getByRole('combobox', { name: 'Select an Aggregate Function' })
    );

    await userEvent.click(getByRole('option', { name: 'Max' }));

    expect(mockUpdatePreferences).toHaveBeenCalledWith('CPU Utilization', {
      aggregateFunction: 'max',
    });

    expect(queryMocks.useCloudPulseMetricsQuery).toHaveBeenCalledWith(
      'linode',
      expect.objectContaining({
        aggregate_function: 'max',
      }),
      expect.any(Object)
    );
  });

  it('should update preferences for interval select', async () => {
    const { getByRole } = renderWithTheme(<CloudPulseWidget {...props} />);
    await userEvent.click(
      getByRole('combobox', { name: 'Select an Interval' })
    );
    await userEvent.click(getByRole('option', { name: '5 min' }));

    expect(mockUpdatePreferences).toHaveBeenCalledWith('CPU Utilization', {
      timeGranularity: { unit: 'min', value: 5 },
    });
    expect(queryMocks.useCloudPulseMetricsQuery).toHaveBeenCalledWith(
      'linode',
      expect.objectContaining({
        time_granularity: { unit: 'min', value: 5 },
      }),
      expect.any(Object)
    );
  });
});
