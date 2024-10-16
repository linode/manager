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
import type { Theme } from '@mui/material';
import type { DataSet } from 'src/components/LineGraph/LineGraph';
import type { CloudPulseResourceTypeMapFlag, FlagSet } from 'src/featureFlags';

interface LabelNameOptionsProps {
  /**
   * flags received from config
   */
  flags: FlagSet;

  /**
   * label for the graph title
   */
  label: string;

  /**
   * key-value to generate dimension name
   */
  metric: { [label: string]: string };

  /**
   * list of CloudPulseResources available
   */
  resources: CloudPulseResources[];

  /**
   * service type of the selected dashboard
   */
  serviceType: string;

  /**
   * unit of the data
   */
  unit: string;
}

interface graphDataOptionsProps {
  /**
   * flags associated with metricsList
   */
  flags: FlagSet;

  /**
   * label for the graph title
   */
  label: string;

  /**
   * data that will be displayed on graph
   */
  metricsList: CloudPulseMetricsResponse | undefined;

  /**
   * list of CloudPulse resources
   */
  resources: CloudPulseResources[];

  /**
   * service type of the selected dashboard
   */
  serviceType: string;

  /**
   * status returned from react query ( loading | error | success)
   */
  status: string | undefined;

  /**
   * unit of the data
   */
  unit: string;

  /**
   * widget chart type
   */
  widgetChartType: string;

  /**
   * preferred color for the widget's graph
   */
  widgetColor: string | undefined;
}

interface MetricRequestProps {
  /**
   * time duration for the metrics data
   */
  duration: TimeDuration;

  /**
   * resource ids selected by user
   */
  resourceIds: string[];

  /**
   * list of CloudPulse resources available
   */
  resources: CloudPulseResources[];

  /**
   * widget filters for metrics data
   */
  widget: Widgets;
}

interface DimensionNameProperties {
  /**
   * flag dimension key mapping for service type
   */
  flag: CloudPulseResourceTypeMapFlag | undefined;

  /**
   * metric key-value to generate dimension name
   */
  metric: { [label: string]: string };

  /**
   * resources list of CloudPulseResources available
   */
  resources: CloudPulseResources[];
}

/**
 *
 * @returns parameters which will be necessary to populate graph & legends
 */
export const generateGraphData = (props: graphDataOptionsProps) => {
  const {
    flags,
    label,
    metricsList,
    resources,
    serviceType,
    status,
    unit,
    widgetChartType,
    widgetColor,
  } = props;

  const dimensions: DataSet[] = [];
  const legendRowsData: LegendRow[] = [];

  // for now we will use this, but once we decide how to work with coloring, it should be dynamic
  const colors = COLOR_MAP.get(widgetColor ?? 'default')!;
  let today = false;

  if (status === 'success') {
    metricsList?.data?.result?.forEach(
      (graphData: CloudPulseMetricsList, index) => {
        if (!graphData) {
          return;
        }
        const transformedData = {
          metric: graphData.metric,
          values: transformData(graphData.values, unit),
        };
        const color = colors[index];
        const { end, start } = convertTimeDurationToStartAndEndTimeRange({
          unit: 'min',
          value: 30,
        }) || {
          end: transformedData.values[transformedData.values.length - 1][0],
          start: transformedData.values[0][0],
        };

        const labelOptions: LabelNameOptionsProps = {
          flags,
          label,
          metric: transformedData.metric,
          resources,
          serviceType,
          unit,
        };

        const dimension = {
          backgroundColor: color,
          borderColor: color,
          data: seriesDataFormatter(transformedData.values, start, end),
          fill: widgetChartType === 'area',
          label: getLabelName(labelOptions),
        };
        // construct a legend row with the dimension
        const legendRow = {
          data: getMetrics(dimension.data as number[][]),
          format: (value: number) => formatToolTip(value, unit),
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
    unit: generateMaxUnit(legendRowsData, unit),
  };
};

/**
 *
 * @param legendRowsData list of legend rows available for the metric
 * @param unit base unit of the values
 * @returns maximum possible rolled up unit based on the unit
 */
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
  props: MetricRequestProps
): CloudPulseMetricsRequest => {
  const { duration, resourceIds, resources, widget } = props;
  return {
    aggregate_function: widget.aggregate_function,
    filters: undefined,
    group_by: widget.group_by,
    metric: widget.metric,
    relative_time_duration: duration ?? widget.time_duration,
    resource_ids: resources
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

/**
 *
 * @returns generated label name for graph dimension
 */
const getLabelName = (props: LabelNameOptionsProps): string => {
  const { flags, label, metric, resources, serviceType, unit } = props;
  // aggregated metric, where metric keys will be 0
  if (!Object.keys(metric).length) {
    // in this case return widget label and unit
    return `${label} (${unit})`;
  }

  const flag = flags?.aclpResourceTypeMap?.find(
    (obj: CloudPulseResourceTypeMapFlag) => obj.serviceType === serviceType
  );

  return getDimensionName({ flag, metric, resources });
};

/**
 *
 * @returns generated dimension name based on resources
 */
export const getDimensionName = (props: DimensionNameProperties): string => {
  const { flag, metric, resources } = props;
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

/**
 *
 * @param id resource id that should be searched in resources list
 * @param resources list of CloudPulseResources available
 * @returns resource label if id is found, the id if label is not found, and fall back on an empty string with an undefined id
 */
export const mapResourceIdToName = (
  id: string | undefined,
  resources: CloudPulseResources[]
): string => {
  const resourcesObj = resources.find(
    (resourceObj) => String(resourceObj.id) === id
  );
  return resourcesObj?.label ?? id ?? '';
};

/**
 *
 * @param data data set to be checked for empty
 * @returns true if data is not empty or contains all the null values otherwise false
 */
export const isDataEmpty = (data: DataSet[]): boolean => {
  return data.every(
    (thisSeries) =>
      thisSeries.data.length === 0 ||
      // If we've padded the data, every y value will be null
      thisSeries.data.every((thisPoint) => thisPoint[1] === null)
  );
};

/**
 *
 * @param theme mui theme
 * @returns The style needed for widget level autocomplete filters
 */
export const getAutocompleteWidgetStyles = (theme: Theme) => ({
  '&& .MuiFormControl-root': {
    minWidth: '90px',
    [theme.breakpoints.down('sm')]: {
      width: '100%', // 100% width for xs and small screens
    },
    width: '90px',
  },
});
