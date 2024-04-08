import { TimeDuration, TimeGranularity, Widgets } from '@linode/api-v4';
import * as React from 'react';

import { profileFactory } from 'src/factories';
import { WithStartAndEnd } from 'src/features/Longview/request.types';
import { getMetricsResponse } from 'src/mocks/metricsMocker';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { FiltersObject } from '../Models/GlobalFilterProperties';
import { CloudViewGraph } from './CloudViewGraph';

const queryMocks = vi.hoisted(() => ({
  useCloudViewMetricsQuery: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudview/metrics', async () => {
  const actual = await vi.importActual('src/queries/cloudview/metrics');
  return {
    ...actual,
    useCloudViewMetricsQuery: queryMocks.useCloudViewMetricsQuery,
  };
});

describe('Cloud View Graph Widget', () => {
  queryMocks.useProfile.mockReturnValue({
    data: profileFactory.build({ user_type: 'child' }),
  });

  it('renders a line graph with required widgets', () => {
    const handleWidgetChange = (widget: Widgets) => {
      // dummy
    };

    const dashboardFilters = {} as FiltersObject;
    dashboardFilters.serviceType = 'linodes';
    dashboardFilters.duration = {} as TimeDuration;
    dashboardFilters.interval = '1m';
    dashboardFilters.region = 'us-east';
    dashboardFilters.resource = ['3'];
    dashboardFilters.step = {} as TimeGranularity;
    dashboardFilters.timeRange = {} as WithStartAndEnd;
    const nowInSeconds = Date.now() / 1000;

    dashboardFilters.timeRange.start = nowInSeconds - 12 * 60 * 60;
    dashboardFilters.timeRange.end = nowInSeconds;

    const requestBody = {
      endTime: dashboardFilters.timeRange.end,
      startTime: dashboardFilters.timeRange.start,
      step: {
        unit: 'minute',
        value: '5',
      },
    };

    queryMocks.useCloudViewMetricsQuery.mockReturnValue({
      data: getMetricsResponse(requestBody),
      isError: false,
      isLoading: false,
      status: 'success',
    });

    const { getByTestId } = renderWithTheme(
      <CloudViewGraph
        ariaLabel={'Test'}
        dashboardFilters={dashboardFilters}
        errorLabel={'Error Loading Data'}
        handleWidgetChange={handleWidgetChange}
        unit={'%'}
        widget={{} as Widgets}
      />
    );

    expect(getByTestId('ZoomOutMapIcon')).toBeInTheDocument();

    expect(getByTestId('linegraph-wrapper')).toBeInTheDocument();

    // there should be no error and circle progress
    expect(() => getByTestId('ErrorOutlineIcon')).toThrow();
    expect(() => getByTestId('circle-progress')).toThrow();
  });

  it('renders a circle progress if metrics API is still loading', () => {
    const handleWidgetChange = (widget: Widgets) => {
      // dummy
    };

    const dashboardFilters = {} as FiltersObject;
    dashboardFilters.serviceType = 'linodes';
    dashboardFilters.duration = {} as TimeDuration;
    dashboardFilters.interval = '1m';
    dashboardFilters.region = 'us-east';
    dashboardFilters.resource = ['3'];
    dashboardFilters.step = {} as TimeGranularity;
    dashboardFilters.timeRange = {} as WithStartAndEnd;
    const nowInSeconds = Date.now() / 1000;

    dashboardFilters.timeRange.start = nowInSeconds - 12 * 60 * 60;
    dashboardFilters.timeRange.end = nowInSeconds;

    const requestBody = {
      endTime: dashboardFilters.timeRange.end,
      startTime: dashboardFilters.timeRange.start,
      step: {
        unit: 'minute',
        value: '5',
      },
    };

    queryMocks.useCloudViewMetricsQuery.mockReturnValue({
      data: getMetricsResponse(requestBody),
      isError: false,
      isLoading: true,
      status: 'loading',
    });

    const { getByTestId } = renderWithTheme(
      <CloudViewGraph
        ariaLabel={'Test'}
        dashboardFilters={dashboardFilters}
        errorLabel={'Error Loading Data'}
        handleWidgetChange={handleWidgetChange}
        unit={'%'}
        widget={{} as Widgets}
      />
    );

    expect(getByTestId('circle-progress')).toBeInTheDocument();

    // there should be no error and linegraph wrapper
    expect(() => getByTestId('ErrorOutlineIcon')).toThrow();
    expect(() => getByTestId('linegraph-wrapper')).toThrow();
  });

  it('renders a error state progress if metrics API response is error', () => {
    const handleWidgetChange = (widget: Widgets) => {
      // dummy
    };

    const dashboardFilters = {} as FiltersObject;
    dashboardFilters.serviceType = 'linodes';
    dashboardFilters.duration = {} as TimeDuration;
    dashboardFilters.interval = '1m';
    dashboardFilters.region = 'us-east';
    dashboardFilters.resource = ['3'];
    dashboardFilters.step = {} as TimeGranularity;
    dashboardFilters.timeRange = {} as WithStartAndEnd;
    const nowInSeconds = Date.now() / 1000;

    dashboardFilters.timeRange.start = nowInSeconds - 12 * 60 * 60;
    dashboardFilters.timeRange.end = nowInSeconds;

    queryMocks.useCloudViewMetricsQuery.mockReturnValue({
      data: {},
      isError: true,
      isLoading: false,
      status: 'error',
    });

    const { getByTestId, getByText } = renderWithTheme(
      <CloudViewGraph
        ariaLabel={'Test'}
        dashboardFilters={dashboardFilters}
        errorLabel={'Error Loading Data'}
        handleWidgetChange={handleWidgetChange}
        unit={'%'}
        widget={{} as Widgets}
      />
    );

    expect(getByTestId('ErrorOutlineIcon')).toBeInTheDocument();
    expect(() => getByTestId('circle-progress')).toThrow();
    expect(getByText('Error Loading Data')).toBeInTheDocument();
  }),
    it('renders a error state progress if metrics API response is error with default error message', () => {
      const handleWidgetChange = (widget: Widgets) => {
        // dummy
      };

      const dashboardFilters = {} as FiltersObject;
      dashboardFilters.serviceType = 'linodes';
      dashboardFilters.duration = {} as TimeDuration;
      dashboardFilters.interval = '1m';
      dashboardFilters.region = 'us-east';
      dashboardFilters.resource = ['3'];
      dashboardFilters.step = {} as TimeGranularity;
      dashboardFilters.timeRange = {} as WithStartAndEnd;
      const nowInSeconds = Date.now() / 1000;

      dashboardFilters.timeRange.start = nowInSeconds - 12 * 60 * 60;
      dashboardFilters.timeRange.end = nowInSeconds;

      queryMocks.useCloudViewMetricsQuery.mockReturnValue({
        data: {},
        isError: true,
        isLoading: false,
        status: 'error',
      });

      const { getByTestId, getByText } = renderWithTheme(
        <CloudViewGraph
          ariaLabel={'Test'}
          dashboardFilters={dashboardFilters}
          handleWidgetChange={handleWidgetChange}
          unit={'%'}
          widget={{} as Widgets}
        />
      );

      expect(getByTestId('ErrorOutlineIcon')).toBeInTheDocument();
      expect(() => getByTestId('circle-progress')).toThrow();
      expect(getByText('Error while rendering widget')).toBeInTheDocument();
    });
});
