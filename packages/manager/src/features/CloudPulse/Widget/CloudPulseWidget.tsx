import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import React from 'react';

import { Divider } from 'src/components/Divider';
import { useFlags } from 'src/hooks/useFlags';
import { useCloudPulseMetricsQuery } from 'src/queries/cloudpulse/metrics';
import { useProfile } from 'src/queries/profile/profile';

import {
  generateGraphData,
  getCloudPulseMetricRequest,
} from '../Utils/CloudPulseWidgetUtils';
import { AGGREGATE_FUNCTION, SIZE, TIME_GRANULARITY } from '../Utils/constants';
import { constructAdditionalRequestFilters } from '../Utils/FilterBuilder';
import { convertValueToUnit, formatToolTip } from '../Utils/unitConversion';
import {
  getUserPreferenceObject,
  updateWidgetPreference,
} from '../Utils/UserPreference';
import { convertStringToCamelCasesWithSpaces } from '../Utils/utils';
import { CloudPulseAggregateFunction } from './components/CloudPulseAggregateFunction';
import { CloudPulseIntervalSelect } from './components/CloudPulseIntervalSelect';
import { CloudPulseLineGraph } from './components/CloudPulseLineGraph';
import { ZoomIcon } from './components/Zoomer';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseResources } from '../shared/CloudPulseResourcesSelect';
import type { Widgets } from '@linode/api-v4';
import type {
  AvailableMetrics,
  TimeDuration,
  TimeGranularity,
} from '@linode/api-v4';
import type { DataSet } from 'src/components/LineGraph/LineGraph';
import type { Metrics } from 'src/utilities/statMetrics';

export interface CloudPulseWidgetProperties {
  /**
   * Apart from above explicit filters, any additional filters for metrics endpoint will go here
   */
  additionalFilters?: CloudPulseMetricsAdditionalFilters[];

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

export interface CloudPulseMetricsAdditionalFilters {
  filterKey: string;
  filterValue: FilterValueType;
}

export interface LegendRow {
  data: Metrics;
  format: (value: number) => {};
  legendColor: string;
  legendTitle: string;
}

export const CloudPulseWidget = (props: CloudPulseWidgetProperties) => {
  const { data: profile } = useProfile();

  const timezone = profile?.timezone ?? DateTime.local().zoneName;

  const [widget, setWidget] = React.useState<Widgets>({ ...props.widget });

  const {
    additionalFilters,
    ariaLabel,
    authToken,
    availableMetrics,
    duration,
    resourceIds,
    resources,
    savePref,
    serviceType,
    timeStamp,
    unit,
  } = props;

  const flags = useFlags();

  const jweTokenExpiryError = 'Token expired';

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
        intervalValue.value !== widget.time_granularity.value
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
   * @param value number value for the tool tip
   * @param unit string unit for the tool tip
   * @returns formatted string using @value & @unit
   */

  const {
    data: metricsList,
    error,
    isLoading,
    status,
  } = useCloudPulseMetricsQuery(
    serviceType,
    {
      ...getCloudPulseMetricRequest({
        duration,
        resourceIds,
        resources,
        widget,
      }),
      filters: constructAdditionalRequestFilters(additionalFilters ?? []), // any additional dimension filters will be constructed and passed here
    },
    {
      authToken,
      isFlags: Boolean(flags),
      label: widget.label,
      timeStamp,
      url: flags.aclpReadEndpoint!,
    }
  );

  let data: DataSet[] = [];

  let legendRows: LegendRow[] = [];
  let today: boolean = false;

  let currentUnit = unit;
  if (!isLoading && metricsList) {
    const generatedData = generateGraphData({
      flags,
      label: widget.label,
      metricsList,
      resources,
      serviceType,
      status,
      unit,
      widgetChartType: widget.chart_type,
      widgetColor: widget.color,
    });

    data = generatedData.dimensions;
    legendRows = generatedData.legendRowsData;
    today = generatedData.today;
    currentUnit = generatedData.unit;
  }

  const metricsApiCallError = error?.[0]?.reason;
  return (
    <Grid item lg={widget.size} xs={12}>
      <Paper data-qa-widget={convertStringToCamelCasesWithSpaces(widget.label)}>
        <Stack spacing={2}>
          <Stack
            alignItems={'center'}
            direction={{ sm: 'row' }}
            gap={{ sm: 0, xs: 2 }}
            justifyContent={{ sm: 'space-between' }}
            padding={1}
          >
            <Typography
              data-qa-widget_header={convertStringToCamelCasesWithSpaces(
                widget.label
              )}
              fontSize={{ sm: '1.5rem', xs: '2rem' }}
              marginLeft={1}
              variant="h1"
            >
              {convertStringToCamelCasesWithSpaces(widget.label)}{' '}
              {!isLoading &&
                `(${currentUnit}${unit.endsWith('ps') ? '/s' : ''})`}
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

          <CloudPulseLineGraph
            error={
              status === 'error' && metricsApiCallError !== jweTokenExpiryError // show the error only if the error is not related to token expiration
                ? metricsApiCallError ?? 'Error while rendering graph'
                : undefined
            }
            legendRows={
              legendRows && legendRows.length > 0 ? legendRows : undefined
            }
            ariaLabel={ariaLabel ? ariaLabel : ''}
            data={data}
            formatData={(data: number) => convertValueToUnit(data, currentUnit)}
            formatTooltip={(value: number) => formatToolTip(value, unit)}
            gridSize={widget.size}
            loading={isLoading || metricsApiCallError === jweTokenExpiryError} // keep loading until we fetch the refresh token
            nativeLegend
            showToday={today}
            timezone={timezone}
            title={widget.label}
          />
        </Stack>
      </Paper>
    </Grid>
  );
};
