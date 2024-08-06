import { isToday } from 'src/utilities/isToday';
import { getMetrics } from 'src/utilities/statMetrics';

import { COLOR_MAP } from './CloudPulseWidgetColorPalette';
import {
  formatToolTip,
  generateUnitByBaseUnit,
  transformData,
} from './unitConversion';
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
import type { CloudPulseResourceTypeMapFlag, FlagSet } from 'src/featureFlags';

export const generateGraphData = (
  widgetObject: {
    label: string;
    serviceType: string;
    status: string | undefined;
    unit: string;
    widgetColor: string | undefined;
  },

  metricsList: CloudPulseMetricsResponse | undefined,
  flags: FlagSet,
  resources: CloudPulseResources[]
) => {
  const dimensions: DataSet[] = [];
  const legendRowsData: LegendRow[] = [];

  // for now we will use this, but once we decide how to work with coloring, it should be dynamic
  const colors = COLOR_MAP.get(widgetObject.widgetColor ?? 'default')!;
  let today = false;

  if (widgetObject.status === 'success' && metricsList?.data?.result?.length) {
    metricsList!.data.result.forEach(
      (graphData: CloudPulseMetricsList, index) => {
        if (!graphData) {
          return;
        }
        const transformedData = {
          metric: graphData.metric,
          values: transformData(graphData.values, widgetObject.unit),
        };
        const color = colors[index];
        const { end, start } = convertTimeDurationToStartAndEndTimeRange({
          unit: 'min',
          value: 30,
        }) || {
          end: transformedData.values[transformedData.values.length - 1][0],
          start: transformedData.values[0][0],
        };

        const dimension = {
          backgroundColor: color,
          borderColor: '',
          data: seriesDataFormatter(transformedData.values, start, end),
          label: getLabelName(
            {
              flags,
              label: widgetObject.label,
              serviceType: widgetObject.serviceType,
              unit: widgetObject.unit,
            },
            transformedData.metric,
            resources
          ),
        };
        // construct a legend row with the dimension
        const legendRow = {
          data: getMetrics(dimension.data as number[][]),
          format: (value: number) => formatToolTip(value, widgetObject.unit),
          legendColor: color,
          legendTitle: dimension.label,
        };
        legendRowsData.push(legendRow);
        dimensions.push(dimension);
        today ||= isToday(start, end);
      }
    );
  }

  return {
    dimensions,
    legendRowsData,
    today,
    unit: generateMaxUnit(legendRowsData, widgetObject.unit),
  };
};

const generateMaxUnit = (legendRowsData: LegendRow[], unit: string) => {
  const maxValue = Math.max(
    0,
    ...legendRowsData?.map((row) => row?.data.max ?? 0)
  );

  return generateUnitByBaseUnit(maxValue, unit);
};
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

const getLabelName = (
  labelObject: {
    flags: FlagSet;
    label: string;
    serviceType: string;
    unit: string;
  },
  metric: { [lable: string]: string },
  resources: CloudPulseResources[]
): string => {
  // aggregated metric, where metric keys will be 0
  if (!Object.keys(metric).length) {
    // in this case return widget label and unit
    return `${labelObject.label} (${labelObject.unit})`;
  }

  const flag = labelObject.flags?.aclpResourceTypeMap?.find(
    (obj: CloudPulseResourceTypeMapFlag) =>
      obj.serviceType === labelObject.serviceType
  );

  return getDimensionName(metric, flag, resources);
};

export const getDimensionName = (
  metric: { [label: string]: string },
  flag: CloudPulseResourceTypeMapFlag | undefined,
  resources: CloudPulseResources[]
): string => {
  return Object.entries(metric)
    .map(([key, value]) => {
      if (key === flag?.dimensionKey) {
        return mapResourceIdToName(value, resources);
      }

      return value ?? '';
    })
    .filter(Boolean)
    .join('_');
};

export const mapResourceIdToName = (
  id: string | undefined,
  resources: CloudPulseResources[]
): string => {
  /**
   * if @id found in @resources list then return its label
   * and if not found then return the @id
   * and if @id is also undefined then return empty string
   */
  return (
    resources.find((resourceObj) => resourceObj?.id === id)?.label ?? id ?? ''
  );
};
