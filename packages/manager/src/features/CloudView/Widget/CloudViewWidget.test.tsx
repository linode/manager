import {
  MetricDefinitions,
  TimeDuration,
  TimeGranularity,
  Widgets,
} from '@linode/api-v4';
import * as React from 'react';

import { profileFactory } from 'src/factories';
import { WithStartAndEnd } from 'src/features/Longview/request.types';
import { getMetricsResponse } from 'src/mocks/metricsMocker';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { FiltersObject } from '../Models/GlobalFilterProperties';
import { CloudViewWidget } from './CloudViewWidget';

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

const errorLabel = 'Error Loading Data';
const circleProgress = 'circle-progress';

describe('Cloud View Graph Widget', () => {
  queryMocks.useProfile.mockReturnValue({
    data: profileFactory.build({ user_type: 'child' }),
  });

  it('renders a line graph with required widgets', () => {
    let widget = {} as Widgets;
    let metricDefinitions = {} as MetricDefinitions;

    const handleWidgetChange = (widgetParam: Widgets) => {
      // dummy
      widget = { ...widgetParam };
      metricDefinitions = { ...metricDefinitions };
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
      <CloudViewWidget
        ariaLabel={'Test'}
        globalFilters={dashboardFilters}
        errorLabel={errorLabel}
        handleWidgetChange={handleWidgetChange}
        metricDefinition={metricDefinitions}
        unit={'%'}
        widget={widget} authToken={''}      />
    );

    expect(getByTestId('ZoomOutMapIcon')).toBeInTheDocument();

    expect(getByTestId('linegraph-wrapper')).toBeInTheDocument();

    // there should be no error and circle progress
    expect(() => getByTestId('ErrorOutlineIcon')).toThrow();
    expect(() => getByTestId(circleProgress)).toThrow();
  });

  it('renders a circle progress if metrics API is still loading', () => {
    let widget = {} as Widgets;
    let metricDefinitions = {} as MetricDefinitions;

    const handleWidgetChange = (widgetParam: Widgets) => {
      // dummy
      widget = { ...widgetParam };
      metricDefinitions = { ...metricDefinitions };
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
      <CloudViewWidget
        ariaLabel={'Test'}
        globalFilters={dashboardFilters}
        errorLabel={errorLabel}
        handleWidgetChange={handleWidgetChange}
        metricDefinition={metricDefinitions}
        unit={'%'}
        widget={widget} authToken={''}      />
    );

    expect(getByTestId(circleProgress)).toBeInTheDocument();

    // there should be no error and linegraph wrapper
    expect(() => getByTestId('ErrorOutlineIcon')).toThrow();
    expect(() => getByTestId('linegraph-wrapper')).toThrow();
  });

  it('renders a error state progress if metrics API response is error', () => {
    let widget = {} as Widgets;
    let metricDefinitions = {} as MetricDefinitions;

    const handleWidgetChange = (widgetParam: Widgets) => {
      // dummy
      widget = { ...widgetParam };
      metricDefinitions = { ...metricDefinitions };
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
      <CloudViewWidget
        ariaLabel={'Test'}
        globalFilters={dashboardFilters}
        errorLabel={errorLabel}
        handleWidgetChange={handleWidgetChange}
        metricDefinition={metricDefinitions}
        unit={'%'}
        widget={widget} authToken={''}      />
    );

    expect(getByTestId('ErrorOutlineIcon')).toBeInTheDocument();
    expect(() => getByTestId(circleProgress)).toThrow();
    expect(getByText(errorLabel)).toBeInTheDocument();
  }),
    it('renders a error state progress if metrics API response is error with default error message', () => {
      let widget = {} as Widgets;
      let metricDefinitions = {} as MetricDefinitions;

      const handleWidgetChange = (widgetParam: Widgets) => {
        // dummy
        widget = { ...widgetParam };
        metricDefinitions = { ...metricDefinitions };
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
        <CloudViewWidget
          ariaLabel={'Test'}
          globalFilters={dashboardFilters}
          handleWidgetChange={handleWidgetChange}
          metricDefinition={metricDefinitions}
          unit={'%'}
          widget={widget} authToken={''}        />
      );

      expect(getByTestId('ErrorOutlineIcon')).toBeInTheDocument();
      expect(() => getByTestId(circleProgress)).toThrow();
      expect(getByText('Error while rendering widget')).toBeInTheDocument();
    });
});
