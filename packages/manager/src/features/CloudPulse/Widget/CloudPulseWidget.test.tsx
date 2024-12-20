import userEvent from '@testing-library/user-event';
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
    label: 'CPU utilization',
    metric: 'system_cpu_utilization_percent',
    metric_type: 'gauge',
    scrape_interval: '2m',
    unit: 'percent',
  },
  duration: { unit: 'min', value: 30 },
  isJweTokenFetching: false,
  resourceIds: ['1', '2'],
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
  it('should render the widget with correct title and unit', () => {
    const { getByText } = renderWithTheme(<CloudPulseWidget {...props} />);
    const title = getByText('CPU Utilization (%)');
    expect(title).toBeInTheDocument();
  });

  it('should render interval select when scrape_interval is provided', () => {
    const { getByTestId } = renderWithTheme(<CloudPulseWidget {...props} />);
    expect(getByTestId('Data aggregation interval')).toBeInTheDocument();
  });

  it('should render aggregate function select when available_aggregate_functions exist', () => {
    const { getByTestId } = renderWithTheme(<CloudPulseWidget {...props} />);
    expect(getByTestId('Aggregation function')).toBeInTheDocument();
  });

  it('should render zoom icon', async () => {
    const { getByTestId } = renderWithTheme(<CloudPulseWidget {...props} />);
    expect(getByTestId('zoom-in')).toBeInTheDocument();
  });

  it('should render line graph component', () => {
    const { container } = renderWithTheme(<CloudPulseWidget {...props} />);
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
    const user = userEvent.setup();

    const { getByTestId } = renderWithTheme(<CloudPulseWidget {...props} />);
    const zoomButton = getByTestId('zoom-in');
    await user.click(zoomButton);
    expect(mockUpdatePreferences).toHaveBeenCalledWith('CPU Utilization', {
      size: 6,
    });
  });

  it('should update preferences for aggregation function select', async () => {
    const user = userEvent.setup();

    const { getByRole } = renderWithTheme(<CloudPulseWidget {...props} />);

    await user.click(
      getByRole('combobox', { name: 'Select an Aggregate Function' })
    );

    await user.click(getByRole('option', { name: 'Max' }));

    expect(mockUpdatePreferences).toHaveBeenCalledWith('CPU Utilization', {
      aggregateFunction: 'max',
    });
  });

  it('should update preferences for interval select', async () => {
    const user = userEvent.setup();

    const { getByRole } = renderWithTheme(<CloudPulseWidget {...props} />);
    await user.click(getByRole('combobox', { name: 'Select an Interval' }));
    await user.click(getByRole('option', { name: '5 min' }));

    expect(mockUpdatePreferences).toHaveBeenCalledWith('CPU Utilization', {
      timeGranularity: { unit: 'min', value: 5 },
    });
  });
});
