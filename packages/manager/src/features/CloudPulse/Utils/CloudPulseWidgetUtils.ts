import { isToday } from 'src/utilities/isToday';
import { roundTo } from 'src/utilities/roundTo';
import { getMetrics } from 'src/utilities/statMetrics';

import { COLOR_MAP } from './CloudPulseWidgetColorPalette';
import {
  convertTimeDurationToStartAndEndTimeRange,
  seriesDataFormatter,
} from './utils';

import type { CloudPulseResources } from '../shared/CloudPulseResourcesSelect';
import type { LegendRow } from '../Widget/CloudPulseWidget';
import type {
  CloudPulseMetricsList,
  CloudPulseMetricsRequest,
  CloudPulseMetricsResponse,
  TimeDuration,
  Widgets,
} from '@linode/api-v4';
import type { DataSet } from 'src/components/LineGraph/LineGraph';

export const generateGraphData = (
  widgetColor: string | undefined,
  metricsList: CloudPulseMetricsResponse | undefined,
  status: string | undefined,
  label: string,
  unit: string
) => {
  const dimensions: DataSet[] = [];
  const legendRowsData: LegendRow[] = [];

  // for now we will use this, but once we decide how to work with coloring, it should be dynamic
  let colors: string[] = COLOR_MAP.get('default')!; // choose default theme by default
  if (widgetColor) {
    colors = COLOR_MAP.get(widgetColor)!;
  }

  let today = false;

  if (status === 'success' && Boolean(metricsList?.data.result.length)) {
    let colorPalatteInfoIndex = 0;
    metricsList!.data.result.forEach((graphData: CloudPulseMetricsList) => {
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
        borderColor: '',
        data: seriesDataFormatter(
          graphData.values,
          startEnd ? startEnd.start : graphData.values[0][0],
          startEnd
            ? startEnd.end
            : graphData.values[graphData.values.length - 1][0]
        ),
        label: `${label} (${unit})`,
      };
      // construct a legend row with the dimension
      const legendRow = {
        data: getMetrics(dimension.data as number[][]),
        format: (value: number) => tooltipValueFormatter(value, unit),
        legendColor: color,
        legendTitle: dimension.label,
      };
      legendRowsData.push(legendRow);
      dimensions.push(dimension);
      colorPalatteInfoIndex = colorPalatteInfoIndex + 1;
      today = today || isToday(startEnd.start, startEnd.end);
    });
  }

  return { dimensions, legendRowsData, today };
};

const tooltipValueFormatter = (value: number, unit: string) =>
  `${roundTo(value)} ${unit}`;

/**
 *
 * @returns a CloudPulseMetricRequest object to be passed as data to metric api call
 */
export const getCloudPulseMetricRequest = (
  widget: Widgets,
  duration: TimeDuration,
  resources: CloudPulseResources[],
  resourceIds: string[]
): CloudPulseMetricsRequest => {
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

  if (resources) {
    request.resource_id = resourceIds.map((obj) => parseInt(obj, 10));
  } else {
    request.resource_id = widget.resource_id.map((obj) => parseInt(obj, 10));
  }

  return request;
};
