import {
  AvailableMetrics,
  CloudViewMetricsRequest,
  Filters,
  TimeGranularity,
  Widgets,
} from '@linode/api-v4';
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { CloudPulseResourceTypeMap } from 'src/featureFlags';
import { useFlags } from 'src/hooks/useFlags';
import { useCloudViewMetricsQuery } from 'src/queries/cloudview/metrics';
import { useProfile } from 'src/queries/profile';
import { isToday as _isToday } from 'src/utilities/isToday';
import { roundTo } from 'src/utilities/roundTo';
import { getMetrics } from 'src/utilities/statMetrics';

import { FiltersObject } from '../Models/GlobalFilterProperties';
import {
  convertTimeDurationToStartAndEndTimeRange,
  convertStringToCamelCasesWithSpaces,
  getDimensionName,
} from '../Utils/CloudPulseUtils';
import { COLOR_MAP } from '../Utils/WidgetColorPalette';
import { CloudViewLineGraph } from './CloudViewLineGraph';
import { AggregateFunctionComponent } from './Components/AggregateFunctionComponent';
import { IntervalSelectComponent } from './Components/IntervalSelectComponent';
import { ZoomIcon } from './Components/Zoomer';
import { seriesDataFormatter } from './Formatters/CloudViewFormatter';

import { updateWidgetPreference } from '../Utils/UserPreference';

import { AGGREGATE_FUNCTION, SIZE, TIME_GRANULARITY } from '../Utils/CloudPulseConstants';

export interface CloudViewWidgetProperties {
  // we can try renaming this CloudViewWidget
  ariaLabel?: string;
  authToken: string;
  availableMetrics: AvailableMetrics | undefined;
  errorLabel?: string; // error label can come from dashboard
  globalFilters?: FiltersObject; // this is dashboard level global filters, its also optional
  // any change in the current widget, call and pass this function and handle in parent component
  handleWidgetChange: (widget: Widgets) => void;
  resources: any[]; // list of resources in a service type

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

export const CloudViewWidget = (props: CloudViewWidgetProperties) => {
  const { data: profile } = useProfile();

  const timezone = profile?.timezone || 'US/Eastern';

  const [data, setData] = React.useState<Array<any>>([]);

  const [legendRows, setLegendRows] = React.useState<any[]>([]);

  const [today, setToday] = React.useState<boolean>(false);

  const flags = useFlags();

  const [
    selectedInterval,
    setSelectedInterval,
  ] = React.useState<TimeGranularity>({ ...props.widget?.time_granularity });

  const [widget, setWidget] = React.useState<Widgets>({ ...props.widget }); // any change in agg_functions, step, group_by, will be published to dashboard component for save

  const getCloudViewMetricsRequest = (): CloudViewMetricsRequest => {
    const request = {} as CloudViewMetricsRequest;
    request.aggregate_function = widget.aggregate_function;
    request.group_by = widget.group_by;
    if (props.globalFilters && props.globalFilters.resource) {
      request.resource_id = props.globalFilters.resource.map((obj) =>
        parseInt(obj, 10)
      );
    } else {
      request.resource_id = widget.resource_id.map((obj) => parseInt(obj, 10));
    }
    request.resource_id = [57352521,57407248]
    request.metric = widget.metric!;
    request.time_duration = props.globalFilters
      ? props.globalFilters.duration!
      : widget.time_duration;
    request.time_granularity = { ...widget.time_granularity };

    // if (props.globalFilters) {
    //   // this has been kept because for mocking data, we will remove this
    //   request.startTime = props.globalFilters?.timeRange.start;
    //   request.endTime = props.globalFilters?.timeRange.end;
    // }
    return request;
  };

  const tooltipValueFormatter = (value: number, unit: string) =>
    `${roundTo(value)} ${unit}`;

  const getServiceType = () => {
    return props.widget.service_type
      ? props.widget.service_type!
      : props.globalFilters
        ? props.globalFilters.serviceType
        : '';
  };

  const getLabelName = (metric: any, serviceType: string) => {
    // aggregated metric, where metric keys will be 0
    if (Object.keys(metric).length == 0) {
      // in this case retrurn widget label and unit
      return props.widget.label + ' (' + props.widget.unit + ')';
    }

    const results =
      flags.aclpResourceTypeMap && flags.aclpResourceTypeMap.length > 0
        ? flags.aclpResourceTypeMap.filter(
          (obj: CloudPulseResourceTypeMap) => obj.serviceName == serviceType
        )
        : [];

    const flag = results && results.length > 0 ? results[0] : undefined;

    return getDimensionName(metric, flag, props.resources);
  };

  const {
    data: metricsList,
    error,
    isLoading,
    status,
  } = useCloudViewMetricsQuery(
    getServiceType()!,
    getCloudViewMetricsRequest(),
    props,
    widget.aggregate_function +
    '_' +
    widget.group_by +
    '_' +
    widget.time_granularity +
    '_' +
    widget.metric +
    '_' +
    widget.label +
    '_' +
    props.globalFilters?.timestamp ?? '',
    true
  ); // fetch the metrics on any property change

  React.useEffect(() => {
    // on any change in the widget object, just publish the changes to parent component using a callback function
    if (
      props.widget.size != widget.size ||
      props.widget.aggregate_function !== widget.aggregate_function ||
      props.widget.time_granularity?.unit !== widget.time_granularity?.unit ||
      props.widget.time_granularity?.value !== widget.time_granularity?.value
    ) {
      props.handleWidgetChange(widget);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget]);

  /**
   * This will be executed, each time when we receive response from metrics api
   * and does formats the data compatible for the graph
   */
  React.useEffect(() => {
    const dimensions: any[] = [];
    const legendRowsData: any[] = [];

    // for now we will use this guy, but once we decide how to work with coloring, it should be dynamic
    const colors: string[] = COLOR_MAP.get(props.widget.color)!;

    if (
      status == 'success' &&
      metricsList.data &&
      metricsList.data.result.length > 0
    ) {
      let index = 0;

      metricsList.data.result.forEach((graphData) => {
        // todo, move it to utils at a widget level
        if (graphData == undefined || graphData == null) {
          return;
        }
        const color = colors[index];
        const startEnd = convertTimeDurationToStartAndEndTimeRange(
          props.globalFilters!.duration!
        );
        const dimension = {
          backgroundColor: color,
          borderColor: color,
          data: seriesDataFormatter(
            graphData.values,
            props.globalFilters?.timeRange
              ? props.globalFilters?.timeRange.start
              : graphData.values[0][0],
            props.globalFilters?.timeRange
              ? props.globalFilters?.timeRange.end
              : graphData.values[graphData.values.length - 1][0]
          ),
          label: getLabelName(graphData.metric, getServiceType()!),
        };

        // construct a legend row with the dimension
        const legendRow = {
          data: getMetrics(dimension.data as number[][]),
          format: (value: number) => tooltipValueFormatter(value, widget.unit),
          legendColor: color,
          legendTitle: dimension.label,
        };
        legendRowsData.push(legendRow);
        dimensions.push(dimension);
        index = index + 1;
        setToday(_isToday(startEnd.start, startEnd.end));
      });

      // chart dimensions
      setData(dimensions);
      setLegendRows(legendRowsData);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, metricsList]);



  const handleZoomToggle = React.useCallback((zoomInValue: boolean) => {
    setWidget((widget) => {
      return { ...widget, size: zoomInValue ? 12 : 6 };
    });

    updateWidgetPreference(widget.label,
      {
        [AGGREGATE_FUNCTION]: widget.aggregate_function,
        [TIME_GRANULARITY]: widget.time_granularity,
        [SIZE]: zoomInValue ? 12 : 6
      });
  }, []);

  const handleAggregateFunctionChange = React.useCallback((aggregateValue: string) => {
    if (aggregateValue !== widget.aggregate_function) {
      setWidget((currentWidget) => {
        return {
          ...currentWidget,
          aggregate_function: aggregateValue,
        };
      });

      updateWidgetPreference(widget.label,
        {
          [AGGREGATE_FUNCTION]: aggregateValue,
          [TIME_GRANULARITY]: widget.time_granularity,
          [SIZE]: widget.size
        });
    }
  }, []);

  const handleIntervalChange = React.useCallback((intervalValue: TimeGranularity) => {
    if (
      intervalValue.unit !== selectedInterval.unit ||
      intervalValue.value !== selectedInterval.value
    ) {
      setWidget((currentWidget) => {
        return {
          ...currentWidget,
          time_granularity: { ...intervalValue },
        };
      });
      setSelectedInterval({ ...intervalValue });
      updateWidgetPreference(widget.label,
        {
          [AGGREGATE_FUNCTION]: widget.aggregate_function,
          [TIME_GRANULARITY]: { ...intervalValue },
          [SIZE]: widget.size
        });
    }
  }, []);


  const handleFilterChange = (widgetFilter: Filters[]) => {
    // todo, add implementation once component is ready
  };

  const handleGroupByChange = (groupby: string) => {
    // todo, add implememtation once component is ready
  };

  const handleGranularityChange = (step: string) => {
    // todo, add implementation once component is ready
  };




  if (isLoading) {
    return (
      <Grid xs={widget.size}>
        <Paper style={{ height: '98%', width: '100%' }}>
          <div style={{ margin: '1%' }}>
            <CircleProgress />
          </div>
        </Paper>
      </Grid>
    );
  }


  return (
    <Grid xs={widget.size}>
      <Paper
        style={{
          borderStyle: 'ridge',
          height: '98%',
          marginTop: '10px',
          width: '100%',
        }}
      >
        {/* add further components like group by resource, aggregate_function, step here , for sample added zoom icon here*/}
        <div className={widget.metric} style={{ margin: '1%' }}>
          <div
            style={{
              alignItems: 'start',
              display: 'flex',
              float: 'right',
              justifyContent: 'flex-end',
              width: '70%',
            }}
          >
            <Grid sx={{ marginRight: 5, width: 100 }}>
              {props.availableMetrics?.scrape_interval && (
                <IntervalSelectComponent
                  default_interval={{ ...selectedInterval }}
                  onIntervalChange={handleIntervalChange}
                  scrape_interval={props.availableMetrics.scrape_interval}
                />
              )}
            </Grid>
            <Grid sx={{ marginRight: 5, width: 100 }}>
              {props.availableMetrics?.available_aggregate_functions &&
                props.availableMetrics.available_aggregate_functions.length >
                0 && (
                  <AggregateFunctionComponent
                    available_aggregate_func={
                      props.availableMetrics?.available_aggregate_functions
                    }
                    default_aggregate_func={widget.aggregate_function}
                    onAggregateFuncChange={handleAggregateFunctionChange}
                  />
                )}
            </Grid>
            <StyledZoomIcon
              handleZoomToggle={handleZoomToggle}
              zoomIn={widget.size == 12 ? true : false}
            />
          </div>
          <CloudViewLineGraph // rename where we have cloudview to cloudpulse
            error={
              status == 'error'
                ? error && error.length > 0
                  ? error[0].reason
                  : 'Error while rendering widget'
                : undefined
            }
            ariaLabel={props.ariaLabel ? props.ariaLabel : ''}
            data={data}
            gridSize={widget.size}
            legendRows={legendRows}
            loading={isLoading}
            nativeLegend={true}
            showToday={today}
            subtitle={props.unit}
            timezone={timezone}
            title={convertStringToCamelCasesWithSpaces(props.widget.label)}
            unit={' ' + props.unit}
          />
        </div>
      </Paper>
    </Grid>
  );
};
