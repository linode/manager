import {
  CloudViewMetricsRequest,
  Filters,
  MetricDefinitions,
  Widgets,
} from '@linode/api-v4';
import { Paper } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { useCloudViewMetricsQuery } from 'src/queries/cloudview/metrics';
import { useProfile } from 'src/queries/profile';
import { roundTo } from 'src/utilities/roundTo';
import { getMetrics } from 'src/utilities/statMetrics';

import { FiltersObject } from '../Models/GlobalFilterProperties';
import { CloudViewLineGraph } from './CloudViewLineGraph';
import { ZoomIcon } from './Components/Zoomer';
import { seriesDataFormatter } from './Formatters/CloudViewFormatter';

export interface CloudViewWidgetProperties {
  // we can try renaming this CloudViewWidget
  ariaLabel?: string;
  errorLabel?: string; // error label can come from dashboard
  globalFilters?: FiltersObject; // this is dashboard level global filters, its also optional
  // any change in the current widget, call and pass this function and handle in parent component
  handleWidgetChange: (widget: Widgets) => void;
  metricDefinition: MetricDefinitions;

  unit: string; // this should come from dashboard, which maintains map for service types in a separate API call
  useColorIndex?: number;
  widget: Widgets; // this comes from dashboard, has inbuilt metrics, agg_func,group_by,filters,gridsize etc , also helpful in publishing any changes
}

export const CloudViewWidget = (props: CloudViewWidgetProperties) => {
  const { data: profile } = useProfile();

  const timezone = profile?.timezone || 'US/Eastern';

  const [data, setData] = React.useState<Array<any>>([]);

  const [legendRows] = React.useState<any[]>([]);

  const [error, setError] = React.useState<boolean>(false);

  const [widget, setWidget] = React.useState<Widgets>({ ...props.widget }); // any change in agg_functions, step, group_by, will be published to dashboard component for save

  const theme = useTheme();

  const getShowToday = () => {
    if (props.globalFilters) {
      return (
        (props.globalFilters?.timeRange.start -
          props.globalFilters?.timeRange.end) /
          3600 <=
        24
      );
    } else {
      // take from widgets itself
      return false;
    }
  };

  const getCloudViewMetricsRequest = (): CloudViewMetricsRequest => {
    const request = {} as CloudViewMetricsRequest;
    request.aggregate_function = widget.aggregate_function;
    request.group_by = widget.group_by;
    if (props.globalFilters) {
      request.instance_id = props.globalFilters.resource!;
    } else {
      request.instance_id = widget.resource_id;
    }
    request.metric = widget.metric!;
    request.duration = props.globalFilters
      ? props.globalFilters.duration!
      : widget.time_duration;
    request.step = props.globalFilters
      ? props.globalFilters.step!
      : widget.time_granularity; // todo, move to widgets

    if (props.globalFilters) {
      // this has been kept because for mocking data, we will remove this
      request.startTime = props.globalFilters?.timeRange.start;
      request.endTime = props.globalFilters?.timeRange.end;
    }
    return request;
  };

  const tooltipValueFormatter = (value: number, unit: string) =>
    `${roundTo(value)}${unit}`;

  const getServiceType = () => {
    return props.widget.serviceType
      ? props.widget.serviceType!
      : props.globalFilters
      ? props.globalFilters.serviceType
      : '';
  };

  const {
    data: metricsList,
    isLoading,
    status,
  } = useCloudViewMetricsQuery(
    getServiceType()!,
    getCloudViewMetricsRequest(),
    props,
    [widget.aggregate_function, widget.group_by, widget.time_granularity]
  ); // fetch the metrics on any property change

  React.useEffect(() => {
    // on any change in the widget object, just publish the changes to parent component using a callback function
    props.handleWidgetChange(widget);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget]);

  /**
   * This will be executed, each time when we receive response from metrics api
   * and does formats the data compatible for the graph
   */
  React.useEffect(() => {
    const dimensions: any[] = [];
    const color: Array<string[]> = [];

    // for now we will use this guy, but once we decide how to work with coloring, it should be dynamic
    const colors: string[] = [
      theme.graphs.cpu.system,
      theme.graphs.cpu.user,
      theme.graphs.cpu.wait,
    ];

    const colors2: string[] = [
      `rgb(136, 247, 192, 0.5)`,
      `rgb(7, 166, 87,0.5)`,
      `rgb(3, 94, 49,0.5)`,
    ];

    const colors3: string[] = [
      `rgb(252, 177, 174, 0.5)`,
      `rgb(196, 100, 96,0.5)`,
      `rgb(232, 16, 7,0.5)`,
    ];

    const colors4: string[] = [
      `rgb(243, 245, 188, 0.5)`,
      `rgb(204, 209, 54,0.5)`,
      `rgb(148, 153, 9,0.5)`,
    ];

    color.push(colors);
    color.push(colors2);
    color.push(colors3);
    color.push(colors4);

    if (status == 'success') {
      let index = 0;
      const useColorCombo =
        props.useColorIndex && props.useColorIndex <= 3
          ? color[props.useColorIndex]
          : color[0];

      metricsList.data.result.forEach((graphData) => {
        // todo, move it to utils at a widget level
        if (graphData == undefined || graphData == null) {
          return;
        }
        const dimension = {
          backgroundColor: useColorCombo[index],
          borderColor: useColorCombo[index++],
          data: seriesDataFormatter(
            graphData.values,
            props.globalFilters && props.globalFilters.timeRange
              ? props.globalFilters.timeRange.start
              : 0,
            props.globalFilters && props.globalFilters.timeRange
              ? props.globalFilters.timeRange.end
              : 0
          ),
          label: graphData.metric.state,
        };

        // construct a legend row with the dimension
        const legendRow = {
          data: getMetrics(dimension.data as number[][]),
          // format: widget.unit == '%' ? formatPercentage : formatNumber,
          format: (value: number) => tooltipValueFormatter(value, widget.unit),
          legendColor: dimension.backgroundColor,
          legendTitle: dimension.label,
        };

        legendRows.push(legendRow);
        dimensions.push(dimension);
      });

      // chart dimensions
      setData(dimensions);
    }

    if (status == 'error') {
      setError(true);
    } else {
      // set error false
      setError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, metricsList]);

  if (isLoading || (status == 'success' && data.length == 0)) {
    return <CircleProgress />;
  }

  const handleZoomToggle = (zoomInValue: boolean) => {
    setWidget((widget) => {
      return { ...widget, size: zoomInValue ? 12 : 6 };
    });
  };

  const handleAggregateFunctionChange = (aggregateValue: string) => {
    // todo, add implementation once component is ready
  };

  const handleFilterChange = (widgetFilter: Filters[]) => {
    // todo, add implementation once component is ready
  };

  const handleGroupByChange = (groupby: string) => {
    // todo, add implememtation once component is ready
  };

  const handleGranularityChange = (step: string) => {
    // todo, add implementation once component is ready
  };

  const handleIntervalChange = () => {
    // todo, add implementation
  };

  const StyledZoomIcon = styled(ZoomIcon, {
    label: 'StyledZoomIcon',
  })({
    display: 'inline-block',
    float: 'right',
    marginLeft: '10px',
    marginTop: '10px',
  });

  return (
    <Grid xs={widget.size}>
      <Paper style={{ height: '98%', width: '100%' }}>
        {/* add further components like group by resource, aggregate_function, step here , for sample added zoom icon here*/}
        <div className={widget.metric} style={{ margin: '1%' }}>
          <StyledZoomIcon
            handleZoomToggle={handleZoomToggle}
            zoomIn={widget.size == 12 ? true : false}
          />
          <CloudViewLineGraph // rename where we have cloudview to cloudpulse
            error={
              error
                ? props.errorLabel && props.errorLabel.length > 0
                  ? props.errorLabel
                  : 'Error while rendering widget'
                : undefined
            }
            ariaLabel={props.ariaLabel ? props.ariaLabel : ''}
            data={data}
            gridSize={props.widget.size}
            legendRows={legendRows}
            loading={isLoading}
            nativeLegend={true}
            showToday={getShowToday()}
            subtitle={props.unit}
            suggestedMax={10}
            timezone={timezone}
            title={props.widget.label}
            unit={props.unit}
          />
        </div>
      </Paper>
    </Grid>
  );
};
