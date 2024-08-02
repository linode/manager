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
  const colors = COLOR_MAP.get(widgetColor ?? 'default')!;
  let today = false;

  if (status === 'success' && Boolean(metricsList?.data.result.length)) {
    metricsList!.data.result.forEach(
      (graphData: CloudPulseMetricsList, index) => {
        // todo, move it to utils at a widget level
        if (!graphData) {
          return;
        }
        const color = colors[index];
        const { end, start } = convertTimeDurationToStartAndEndTimeRange({
          unit: 'min',
          value: 30,
        }) || {
          end: graphData.values[graphData.values.length - 1][0],
          start: graphData.values[0][0],
        };

        const dimension = {
          backgroundColor: color,
          borderColor: '',
          data: seriesDataFormatter(graphData.values, start, end),
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
        today ||= isToday(start, end);
      }
    );
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
  return {
    aggregate_function: widget.aggregate_function,
    filters: undefined,
    group_by: widget.group_by,
    metric: widget.metric,
    relative_time_duration: duration ?? widget.time_duration,
    resource_id: resources
      ? resourceIds.map((obj) => parseInt(obj, 10))
      : widget.resource_id.map((obj) => parseInt(obj, 10)),
    time_granularity:
      widget.time_granularity.unit === 'Auto'
        ? undefined
        : {
            unit: widget.time_granularity.unit,
            value: widget.time_granularity.value,
          },
  };
};
