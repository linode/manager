import { Widgets } from '@linode/api-v4';
import { Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import { makeStyles } from 'tss-react/mui';

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

import type {
  AvailableMetrics,
  TimeDuration,
  TimeGranularity,
} from '@linode/api-v4';
import type { Theme } from '@mui/material';

export interface CloudPulseWidgetProperties {
  // we can try renaming this CloudPulseWidget
  ariaLabel?: string;
  authToken: string;
  availableMetrics: AvailableMetrics | undefined;
  duration: TimeDuration;
  errorLabel?: string; // error label can come from dashboard

  resourceIds: string[];
  resources: any[]; // list of resources in a service type
  savePref?: boolean;
  serviceType: string;
  timeStamp: number;
  unit: string; // this should come from dashboard, which maintains map for service types in a separate API call
  useColorIndex?: number;
  widget: Widgets; // this comes from dashboard, has inbuilt metrics, agg_func,group_by,filters,gridsize etc , also helpful in publishing any changes
}

const StyledZoomIcon = styled(ZoomIcon, {
  label: 'StyledZoomIcon',
})({
  display: 'inline-block',
  marginLeft: '10px',
  marginTop: '10px',
});

const useStyles = makeStyles()((theme: Theme) => ({
  title: {
    '& > span': {
      color: theme.palette.text.primary,
    },
    color: theme.color.headline,
    fontFamily: theme.font.bold,
    fontSize: '1.30rem',
    marginLeft: '8px',
  },
}));

export const CloudPulseWidget = (props: CloudPulseWidgetProperties) => {
  const { classes } = useStyles();
  const { data: profile } = useProfile();

  const timezone = profile?.timezone ?? 'US/Eastern';

  const [widget, setWidget] = React.useState<Widgets>({ ...props.widget });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [today, setToday] = React.useState<boolean>(false); // Temporarily disabled eslint for this line. Will be removed in future PRs

  /**
   *
   * @param zoomInValue: True if zoom in clicked &  False if zoom out icon clicked
   */
  const handleZoomToggle = React.useCallback((zoomInValue: boolean) => {
    if (props.savePref) {
      updateWidgetPreference(props.widget.label, {
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
        if (props.savePref) {
          updateWidgetPreference(props.widget.label, {
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
        if (props.savePref) {
          updateWidgetPreference(props.widget.label, {
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
    if (props.savePref) {
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
    <Grid item xs={widget.size}>
      <Paper
        style={{
          border: 'solid 1px #e3e5e8',
          height: '98%',
          marginTop: '10px',
          width: '100%',
        }}
      >
        <div className={widget.metric} style={{ margin: '1%' }}>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              width: '100%',
            }}
          >
            <Grid sx={{ marginRight: 'auto' }}>
              <Typography className={classes.title}>
                {convertStringToCamelCasesWithSpaces(props.widget.label)}
              </Typography>
            </Grid>
            <Grid sx={{ marginRight: 5, width: 100 }}>
              {props.availableMetrics?.scrape_interval && (
                <CloudPulseIntervalSelect
                  default_interval={widget?.time_granularity}
                  onIntervalChange={handleIntervalChange}
                  scrape_interval={props.availableMetrics.scrape_interval}
                />
              )}
            </Grid>
            <Grid sx={{ marginRight: 5, width: 100 }}>
              {props.availableMetrics?.available_aggregate_functions &&
                props.availableMetrics.available_aggregate_functions.length >
                  0 && (
                  <CloudPulseAggregateFunction
                    availableAggregateFunctions={
                      props.availableMetrics?.available_aggregate_functions
                    }
                    defaultAggregateFunction={widget?.aggregate_function}
                    onAggregateFuncChange={handleAggregateFunctionChange}
                  />
                )}
            </Grid>
            <StyledZoomIcon
              handleZoomToggle={handleZoomToggle}
              zoomIn={widget?.size == 12 ? true : false}
            />
          </div>
          <Divider spacingBottom={32} spacingTop={15} />

          <div style={{ position: 'relative' }}>
            <LineGraph data={[]} showToday={today} timezone={timezone} />
          </div>
        </div>
      </Paper>
    </Grid>
  );
};
