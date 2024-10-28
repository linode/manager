import { Box, Grid, Stack, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';
import React from 'react';

import { Paper } from 'src/components/Paper';
import { useFlags } from 'src/hooks/useFlags';
import { useCloudPulseMetricsQuery } from 'src/queries/cloudpulse/metrics';
import { useProfile } from 'src/queries/profile/profile';

import {
  generateGraphData,
  getCloudPulseMetricRequest,
} from '../Utils/CloudPulseWidgetUtils';
import { AGGREGATE_FUNCTION, SIZE, TIME_GRANULARITY } from '../Utils/constants';
import { constructAdditionalRequestFilters } from '../Utils/FilterBuilder';
import {
  convertValueToUnit,
  formatToolTip,
  generateCurrentUnit,
} from '../Utils/unitConversion';
import { useAclpPreference } from '../Utils/UserPreference';
import { convertStringToCamelCasesWithSpaces } from '../Utils/utils';
import { CloudPulseAggregateFunction } from './components/CloudPulseAggregateFunction';
import { CloudPulseIntervalSelect } from './components/CloudPulseIntervalSelect';
import { CloudPulseLineGraph } from './components/CloudPulseLineGraph';
import { ZoomIcon } from './components/Zoomer';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseResources } from '../shared/CloudPulseResourcesSelect';
import type {
  AvailableMetrics,
  TimeDuration,
  TimeGranularity,
} from '@linode/api-v4';
import type { Widgets } from '@linode/api-v4';
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
  const { updateWidgetPreference: updatePreferences } = useAclpPreference();
  const { data: profile } = useProfile();
  const timezone = profile?.timezone ?? DateTime.local().zoneName;

  const [widget, setWidget] = React.useState<Widgets>({ ...props.widget });

  const theme = useTheme();

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
    widget: widgetProp,
  } = props;
  const flags = useFlags();
  const scaledWidgetUnit = React.useRef(generateCurrentUnit(unit));

  const jweTokenExpiryError = 'Token expired';

  /**
   *
   * @param zoomInValue: True if zoom in clicked &  False if zoom out icon clicked
   */
  const handleZoomToggle = React.useCallback((zoomInValue: boolean) => {
    if (savePref) {
      updatePreferences(widget.label, {
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

      if (savePref) {
        updatePreferences(widget.label, {
          [AGGREGATE_FUNCTION]: aggregateValue,
        });
      }

      setWidget((currentWidget: Widgets) => {
        return {
          ...currentWidget,
          aggregate_function: aggregateValue,
        };
      });
    },
    []
  );

  /**
   *
   * @param intervalValue : TimeGranularity object selected from the interval select
   */
  const handleIntervalChange = React.useCallback(
    (intervalValue: TimeGranularity) => {
      if (savePref) {
        updatePreferences(widget.label, {
          [TIME_GRANULARITY]: { ...intervalValue },
        });
      }

      setWidget((currentWidget: Widgets) => {
        return {
          ...currentWidget,
          time_granularity: { ...intervalValue },
        };
      });
    },
    []
  );

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
    scaledWidgetUnit.current = generatedData.unit; // here state doesn't matter, as this is always the latest re-render
  }

  const metricsApiCallError = error?.[0]?.reason;

  return (
    <Grid container item lg={widget.size} xs={12}>
      <Stack flexGrow={1} spacing={2}>
        <Paper
          data-qa-widget={convertStringToCamelCasesWithSpaces(widget.label)}
          sx={{ flexGrow: 1 }}
        >
          <Stack
            alignItems={'center'}
            direction={{ sm: 'row' }}
            gap={{ sm: 0, xs: 2 }}
            justifyContent={{ sm: 'space-between' }}
            marginBottom={1}
            padding={1}
          >
            <Typography marginLeft={1} variant="h2">
              {convertStringToCamelCasesWithSpaces(widget.label)} (
              {scaledWidgetUnit.current}
              {unit.endsWith('ps') ? '/s' : ''})
            </Typography>
            <Stack
              alignItems={'center'}
              direction={{ sm: 'row' }}
              gap={2}
              maxHeight={`calc(${theme.spacing(10)} + 5px)`}
              overflow="auto"
              width={{ sm: 'inherit', xs: '100%' }}
            >
              {availableMetrics?.scrape_interval && (
                <CloudPulseIntervalSelect
                  defaultInterval={widgetProp?.time_granularity}
                  onIntervalChange={handleIntervalChange}
                  scrapeInterval={availableMetrics.scrape_interval}
                />
              )}
              {Boolean(
                availableMetrics?.available_aggregate_functions?.length
              ) && (
                <CloudPulseAggregateFunction
                  availableAggregateFunctions={
                    availableMetrics!.available_aggregate_functions
                  }
                  defaultAggregateFunction={widgetProp?.aggregate_function}
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
          <CloudPulseLineGraph
            error={
              status === 'error' && metricsApiCallError !== jweTokenExpiryError // show the error only if the error is not related to token expiration
                ? metricsApiCallError ?? 'Error while rendering graph'
                : undefined
            }
            formatData={(data: number) =>
              convertValueToUnit(data, scaledWidgetUnit.current)
            }
            legendRows={
              legendRows && legendRows.length > 0 ? legendRows : undefined
            }
            ariaLabel={ariaLabel ? ariaLabel : ''}
            data={data}
            formatTooltip={(value: number) => formatToolTip(value, unit)}
            gridSize={widget.size}
            loading={isLoading || metricsApiCallError === jweTokenExpiryError} // keep loading until we fetch the refresh token
            showToday={today}
            timezone={timezone}
            title={widget.label}
          />
        </Paper>
      </Stack>
    </Grid>
  );
};
