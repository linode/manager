import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { Divider } from 'src/components/Divider';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { useFlags } from 'src/hooks/useFlags';
import { useCloudViewMetricsQuery } from 'src/queries/cloudpulse/metrics';
import { useProfile } from 'src/queries/profile/profile';
import { isToday } from 'src/utilities/isToday';
import { roundTo } from 'src/utilities/roundTo';
import { getMetrics } from 'src/utilities/statMetrics';

import { COLOR_MAP } from '../Utils/CloudPulseWidgetColorPalette';
import { AGGREGATE_FUNCTION, SIZE, TIME_GRANULARITY } from '../Utils/constants';
import {
  getUserPreferenceObject,
  updateWidgetPreference,
} from '../Utils/UserPreference';
import {
  convertStringToCamelCasesWithSpaces,
  convertTimeDurationToStartAndEndTimeRange,
  seriesDataFormatter,
} from '../Utils/utils';
import { CloudPulseAggregateFunction } from './components/CloudPulseAggregateFunction';
import { CloudPulseIntervalSelect } from './components/CloudPulseIntervalSelect';
import { CloudPulseLineGraph } from './components/CloudPulseLineGraph';
import { ZoomIcon } from './components/Zoomer';

import type { CloudPulseResources } from '../shared/CloudPulseResourcesSelect';
import type {
  AvailableMetrics,
  CloudPulseMetricsList,
  CloudPulseMetricsRequest,
  TimeDuration,
  TimeGranularity,
} from '@linode/api-v4';
import type { Widgets } from '@linode/api-v4';

export interface CloudPulseWidgetProperties {
  /**
   * Aria label for this widget
   */
  ariaLabel?: string;

  /**
   * token to fetch metrics data
   */
  authToken: string;

  /**
   * metrics defined of this widget
   */
  availableMetrics: AvailableMetrics | undefined;

  /**
   * time duration to fetch the metrics data in this widget
   */
  duration: TimeDuration;

  /**
   * Any error to be shown in this widget
   */
  errorLabel?: string;

  /**
   * resources ids selected by user to show metrics for
   */
  resourceIds: string[];

  /**
   * List of resources available of selected service type
   */
  resources: CloudPulseResources[];

  /**
   * optional flag to check whether changes should be stored in preferences or not (in case this component is reused)
   */
  savePref?: boolean;

  /**
   * Service type selected by user
   */
  serviceType: string;

  /**
   * optional timestamp to pass as react query param to forcefully re-fetch data
   */
  timeStamp?: number;

  /**
   * this should come from dashboard, which maintains map for service types in a separate API call
   */
  unit: string;

  /**
   * color index to be selected from available them if not theme is provided by user
   */
  useColorIndex?: number;

  /**
   * this comes from dashboard, has inbuilt metrics, agg_func,group_by,filters,gridsize etc , also helpful in publishing any changes
   */
  widget: Widgets;
}

export const CloudPulseWidget = (props: CloudPulseWidgetProperties) => {
  const { data: profile } = useProfile();

  const timezone = profile?.timezone ?? DateTime.local().zoneName;

  const [widget, setWidget] = React.useState<Widgets>({ ...props.widget });

  const [data, setData] = React.useState<Array<any>>([]);

  const [legendRows, setLegendRows] = React.useState<any[]>([]);

  const {
    authToken,
    availableMetrics,
    duration,
    savePref,
    serviceType,
    timeStamp,
    unit,
  } = props;

  const flags = useFlags();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [today, setToday] = React.useState<boolean>(false); // Temporarily disabled eslint for this line. Will be removed in future PRs

  /**
   *
   * @param zoomInValue: True if zoom in clicked &  False if zoom out icon clicked
   */
  const handleZoomToggle = React.useCallback((zoomInValue: boolean) => {
    if (savePref) {
      updateWidgetPreference(widget.label, {
        [SIZE]: zoomInValue ? 12 : 6,
      });
    }

    setWidget((currentWidget: Widgets) => {
      return {
        ...currentWidget,
        size: zoomInValue ? 12 : 6,
      };
    });
  }, []);

  /**
   *
   * @param aggregateValue: aggregate function select from AggregateFunction component
   */
  const handleAggregateFunctionChange = React.useCallback(
    (aggregateValue: string) => {
      // To avoid updation if user again selected the currently selected value from drop down.
      if (aggregateValue !== widget.aggregate_function) {
        if (savePref) {
          updateWidgetPreference(widget.label, {
            [AGGREGATE_FUNCTION]: aggregateValue,
          });
        }

        setWidget((currentWidget: Widgets) => {
          return {
            ...currentWidget,
            aggregate_function: aggregateValue,
          };
        });
      }
    },
    []
  );

  /**
   *
   * @param intervalValue : TimeGranularity object selected from the interval select
   */
  const handleIntervalChange = React.useCallback(
    (intervalValue: TimeGranularity) => {
      if (
        !widget.time_granularity ||
        intervalValue.unit !== widget.time_granularity.unit ||
        intervalValue.value !== widget.time_duration.value
      ) {
        if (savePref) {
          updateWidgetPreference(widget.label, {
            [TIME_GRANULARITY]: { ...intervalValue },
          });
        }

        setWidget((currentWidget: Widgets) => {
          return {
            ...currentWidget,
            time_granularity: { ...intervalValue },
          };
        });
      }
    },
    []
  );
  // Update the widget preference if already not present in the preferences
  React.useEffect(() => {
    if (savePref) {
      const widgets = getUserPreferenceObject()?.widgets;
      if (!widgets || !widgets[widget.label]) {
        updateWidgetPreference(widget.label, {
          [AGGREGATE_FUNCTION]: widget.aggregate_function,
          [SIZE]: widget.size,
          [TIME_GRANULARITY]: widget.time_granularity,
        });
      }
    }
  }, []);

  /**
   *
   * @returns a CloudPulseMetricRequest object to be passed as data to metric api call
   */
  const getCloudViewMetricsRequest = (): CloudPulseMetricsRequest => {
    const request: CloudPulseMetricsRequest = {
      aggregate_function: widget.aggregate_function,
      filters: undefined,
      group_by: widget.group_by,
      metric: widget.metric,
      relative_time_duration: duration ?? widget.time_duration,
      resource_id: [],
      time_granularity:
        widget.time_granularity.unit === 'Auto'
          ? undefined
          : {
              unit: widget.time_granularity.unit,
              value: widget.time_granularity.value,
            },
    };

    if (props && props.resources) {
      request.resource_id = props.resourceIds.map((obj) => parseInt(obj, 10));
    } else {
      request.resource_id = widget.resource_id.map((obj) => parseInt(obj, 10));
    }

    return request;
  };

  /**
   *
   * @param value number value for the tool tip
   * @param unit string unit for the tool tip
   * @returns formatted string using @value & @unit
   */
  const tooltipValueFormatter = (value: number, unit: string) =>
    `${roundTo(value)} ${unit}`;

  const {
    data: metricsList,
    error,
    isLoading,
    status,
  } = useCloudViewMetricsQuery(
    serviceType,
    getCloudViewMetricsRequest(),
    authToken,
    [
      widget.aggregate_function,
      widget.group_by,
      widget.time_granularity,
      widget.metric,
      widget.label,
      timeStamp,
    ].join('-'),
    Boolean(flags),
    flags.aclpReadEndpoint!
  );

  React.useEffect(() => {
    const dimensions: any[] = [];
    const legendRowsData: any[] = [];

    // for now we will use this, but once we decide how to work with coloring, it should be dynamic
    let colors: string[] = COLOR_MAP.get('default')!; // choose default theme by default
    if (widget.color) {
      colors = COLOR_MAP.get(widget.color)!;
    }

    if (
      status == 'success' &&
      metricsList.data &&
      metricsList.data.result.length > 0
    ) {
      let colorPalatteInfoIndex = 0;
      metricsList.data.result.forEach((graphData: CloudPulseMetricsList) => {
        // todo, move it to utils at a widget level
        if (!graphData) {
          return;
        }
        const color = colors[colorPalatteInfoIndex];
        const startEnd = convertTimeDurationToStartAndEndTimeRange({
          unit: 'min',
          value: 30,
        });
        const dimension = {
          backgroundColor: color,
          data: seriesDataFormatter(
            graphData.values,
            startEnd ? startEnd.start : graphData.values[0][0],
            startEnd
              ? startEnd.end
              : graphData.values[graphData.values.length - 1][0]
          ),
          label: `${widget.label} (${widget.unit})`,
        };
        // construct a legend row with the dimension
        const legendRow = {
          data: getMetrics(dimension.data as number[][]),
          format: (value: number) => tooltipValueFormatter(value, props.unit),
          legendColor: color,
          legendTitle: dimension.label,
        };
        legendRowsData.push(legendRow);
        dimensions.push(dimension);
        colorPalatteInfoIndex = colorPalatteInfoIndex + 1;
        setToday(isToday(startEnd.start, startEnd.end));
      });

      // chart dimensions
      setData(dimensions);
      setLegendRows(legendRowsData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, metricsList]);

  return (
    <Grid item lg={widget.size} xs={12}>
      <Paper>
        <Stack spacing={2}>
          <Stack
            alignItems={'center'}
            direction={{ sm: 'row' }}
            gap={{ sm: 0, xs: 2 }}
            justifyContent={{ sm: 'space-between' }}
            padding={1}
          >
            <Typography
              fontSize={{ sm: '1.5rem', xs: '2rem' }}
              marginLeft={1}
              variant="h1"
            >
              {convertStringToCamelCasesWithSpaces(widget.label)}
              {` (${unit})`}
            </Typography>
            <Stack
              alignItems={'center'}
              direction={{ sm: 'row' }}
              gap={1}
              width={{ sm: 'inherit', xs: '100%' }}
            >
              {availableMetrics?.scrape_interval && (
                <CloudPulseIntervalSelect
                  default_interval={widget?.time_granularity}
                  onIntervalChange={handleIntervalChange}
                  scrape_interval={availableMetrics.scrape_interval}
                />
              )}
              {Boolean(
                availableMetrics?.available_aggregate_functions?.length
              ) && (
                <CloudPulseAggregateFunction
                  availableAggregateFunctions={
                    availableMetrics!.available_aggregate_functions
                  }
                  defaultAggregateFunction={widget?.aggregate_function}
                  onAggregateFuncChange={handleAggregateFunctionChange}
                />
              )}
              <Box sx={{ display: { lg: 'flex', xs: 'none' } }}>
                <ZoomIcon
                  handleZoomToggle={handleZoomToggle}
                  zoomIn={widget?.size === 12}
                />
              </Box>
            </Stack>
          </Stack>
          <Divider />
          {!isLoading && !Boolean(error) && (
            <CloudPulseLineGraph // rename where we have cloudview to cloudpulse
              error={
                status == 'error'
                  ? error && error.length > 0
                    ? error[0].reason
                    : 'Error while rendering widget'
                  : undefined
              }
              legendRows={
                legendRows && legendRows.length > 0 ? legendRows : undefined
              }
              ariaLabel={props.ariaLabel ? props.ariaLabel : ''}
              data={data}
              gridSize={widget.size}
              loading={isLoading}
              nativeLegend={true}
              showToday={today}
              timezone={timezone}
              title={''}
              unit={unit}
            />
          )}
          {isLoading && !Boolean(error) && <CircleProgress />}
          {Boolean(error?.length) && (
            <ErrorState errorText={error![0].reason} />
          )}
        </Stack>
      </Paper>
    </Grid>
  );
};
