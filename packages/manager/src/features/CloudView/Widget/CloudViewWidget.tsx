import { CloudViewMetricsRequest, Filters, Widgets } from '@linode/api-v4';
import { styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { useCloudViewMetricsQuery } from 'src/queries/cloudview/metrics';
import { useProfile } from 'src/queries/profile';
import { formatPercentage, getMetrics } from 'src/utilities/statMetrics';

import { FiltersObject } from '../Models/GlobalFilterProperties';
import { CloudViewLineGraph } from './CloudViewLineGraph';
import { ZoomIcon } from './Components/Zoomer';
import { seriesDataFormatter } from './Formatters/CloudViewFormatter';

export interface CloudViewWidgetProperties {
  // we can try renaming this CloudViewWidget
  ariaLabel?: string;
  dashboardFilters: FiltersObject; // this is dashboard level global filters
  errorLabel?: string; // error label can come from dashboard
  // any change in the current widget, call and pass this function and handle in parent component
  handleWidgetChange: (widget: Widgets) => void;
  unit: string; // this should come from dashboard, which maintains map for service types in a separate API call

  widget: Widgets; // this comes from dashboard, has inbuilt metrics, agg_func,group_by,filters,gridsize etc , also helpful in publishing any changes
}

export const CloudViewWidget = (props: CloudViewWidgetProperties) => {
  const { data: profile } = useProfile();

  const timezone = profile?.timezone || 'US/Eastern';

  const [data, setData] = React.useState<Array<any>>([]);

  const [legendRows] = React.useState<any[]>([]);

  const [error, setError] = React.useState<boolean>(false);

  const [zoomIn, setZoomIn] = React.useState<boolean>(props.widget.size == 12);

  const [widget, setWidget] = React.useState<Widgets>({ ...props.widget }); // any change in agg_functions, step, group_by, will be published to dashboard component for save

  const theme = useTheme();

  const getShowToday = () => {
    return (
      (props.dashboardFilters?.timeRange.start -
        props.dashboardFilters?.timeRange.end) /
        3600 <=
      24
    );
  };

  const getCloudViewMetricsRequest = (): CloudViewMetricsRequest => {
    const request = {} as CloudViewMetricsRequest;
    request.aggregate_function = widget.aggregate_function;
    request.group_by = widget.group_by;
    request.instance_id = props.dashboardFilters.resource!;
    request.metric = widget.metric!;
    request.duration = props.dashboardFilters.duration!;
    request.step = props.dashboardFilters.step!; // todo, move to widgets
    request.startTime = props.dashboardFilters?.timeRange.start;
    request.endTime = props.dashboardFilters?.timeRange.end;
    return request;
  };

  const { data: metricsList, isLoading, status } = useCloudViewMetricsQuery(
    props.widget.serviceType!,
    getCloudViewMetricsRequest(),
    props,
    widget
  ); // fetch the metrics on any property change

  React.useEffect(() => {
    // on any change in the widget object, just publish the changes to parent component using a callback function
    props.handleWidgetChange(widget);
  }, [props, widget]);

  /**
   * This will be executed, each time when we receive response from metrics api
   * and does formats the data compatible for the graph
   */
  React.useEffect(() => {
    const dimensions: any[] = [];

    // for now we will use this guy, but once we decide how to work with coloring, it should be dynamic
    const colors: string[] = [
      theme.graphs.cpu.system,
      theme.graphs.cpu.user,
      theme.graphs.cpu.wait,
    ];

    if (status == 'success') {
      let index = 0;

      metricsList.data.result.forEach((graphData) => {
        // todo, move it to utils at a widget level
        const dimension = {
          backgroundColor: colors[index++],
          borderColor: colors[index],
          data: seriesDataFormatter(
            graphData.values,
            props.dashboardFilters && props.dashboardFilters.timeRange
              ? props.dashboardFilters.timeRange.start
              : 0,
            props.dashboardFilters && props.dashboardFilters.timeRange
              ? props.dashboardFilters.timeRange.end
              : 0
          ),
          label: graphData.metric.state,
        };

        // construct a legend row with the dimension
        const legendRow = {
          data: getMetrics(dimension.data as number[][]),
          format: formatPercentage,
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

  if (isLoading) {
    return <CircleProgress />;
  }

  const handleZoomToggle = (zoomIn: boolean) => {
    setZoomIn(zoomIn);
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

  const StyledZoomIcon = styled(ZoomIcon, {
    label: 'StyledZoomIcon',
  })({
    float: 'right',
  });

  return (
    <Grid xs={zoomIn ? 12 : 6}>
      {/* add further components like group by resource, aggregate_function, step here , for sample added zoom icon here*/}
      <StyledZoomIcon handleZoomToggle={handleZoomToggle} zoomIn={zoomIn} />
      <CloudViewLineGraph
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
    </Grid>
  );
};
