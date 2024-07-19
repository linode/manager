import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import React from 'react';

import { Divider } from 'src/components/Divider';
import { LineGraph } from 'src/components/LineGraph/LineGraph';
import { useProfile } from 'src/queries/profile/profile';

import { AGGREGATE_FUNCTION, SIZE, TIME_GRANULARITY } from '../Utils/constants';
import {
  getUserPreferenceObject,
  updateWidgetPreference,
} from '../Utils/UserPreference';
import { convertStringToCamelCasesWithSpaces } from '../Utils/utils';
import { CloudPulseAggregateFunction } from './components/CloudPulseAggregateFunction';
import { CloudPulseIntervalSelect } from './components/CloudPulseIntervalSelect';
import { ZoomIcon } from './components/Zoomer';

import type { CloudPulseResources } from '../shared/CloudPulseResourcesSelect';
import type {
  AvailableMetrics,
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

  const timezone = profile?.timezone ?? 'US/Eastern';

  const [widget, setWidget] = React.useState<Widgets>({ ...props.widget });

  const { availableMetrics, savePref } = props;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [today, _] = React.useState<boolean>(false); // Temporarily disabled eslint for this line. Will be removed in future PRs

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

    setWidget((currentWidget) => {
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

        setWidget((currentWidget) => {
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

        setWidget((currentWidget) => {
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
              {convertStringToCamelCasesWithSpaces(widget.label)}{' '}
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
          <Box p={2}>
            <LineGraph data={[]} showToday={today} timezone={timezone} />
          </Box>
        </Stack>
      </Paper>
    </Grid>
  );
};
