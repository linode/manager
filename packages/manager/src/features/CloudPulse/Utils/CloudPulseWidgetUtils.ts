import { Alias } from '@linode/design-language-system';

import { getMetrics } from 'src/utilities/statMetrics';

import {
  convertValueToUnit,
  formatToolTip,
  generateUnitByBaseUnit,
  transformData,
} from './unitConversion';
import {
  convertTimeDurationToStartAndEndTimeRange,
  seriesDataFormatter,
} from './utils';

import type { CloudPulseResources } from '../shared/CloudPulseResourcesSelect';
import type { DataSet } from '../Widget/components/CloudPulseLineGraph';
import type {
  CloudPulseMetricsList,
  CloudPulseMetricsRequest,
  CloudPulseMetricsResponse,
  TimeDuration,
  Widgets,
} from '@linode/api-v4';
import type { Theme } from '@mui/material';
import type { AreaProps } from 'src/components/AreaChart/AreaChart';
import type { MetricsDisplayRow } from 'src/components/LineGraph/MetricsDisplay';
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

interface GraphDataOptionsProps {
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

interface GraphData {
  /**
   * array of area props to be shown on graph
   */
  areas: AreaProps[];

  /**
   * plots to be shown of each dimension
   */
  dimensions: DataSet[];

  /**
   * legends rows available for each dimension
   */
  legendRowsData: MetricsDisplayRow[];

  /**
   * maximum possible rolled up unit for the data
   */
  unit: string;
}

/**
 *
 * @returns parameters which will be necessary to populate graph & legends
 */
export const generateGraphData = (props: GraphDataOptionsProps): GraphData => {
  const {
    flags,
    label,
    metricsList,
    resources,
    serviceType,
    status,
    unit,
  } = props;
  const legendRowsData: MetricsDisplayRow[] = [];
  const dimension: { [timestamp: number]: { [label: string]: number } } = {};
  const areas: AreaProps[] = [];
  const colors = Object.values(Alias.Chart.Categorical);
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
        const labelName = getLabelName(labelOptions);
        const data = seriesDataFormatter(transformedData.values, start, end);
        const color = colors[index].Primary;
        areas.push({
          color,
          dataKey: labelName,
        });

        data.forEach((dataPoint) => {
          const timestamp = dataPoint[0];
          const value = dataPoint[1];
          if (value !== null) {
            dimension[timestamp] = {
              ...dimension[timestamp],
              [labelName]: value,
            };
          }
        });
        // construct a legend row with the dimension
        const legendRow: MetricsDisplayRow = {
          data: getMetrics(data as number[][]),
          format: (value: number) => formatToolTip(value, unit),
          legendColor: color,
          legendTitle: labelName,
        };
        legendRowsData.push(legendRow);
      }
    );
  }

  const maxUnit = generateMaxUnit(legendRowsData, unit);
  const dimensions = Object.entries(dimension)
    .map(
      ([timestamp, resource]): DataSet => {
        const rolledUpData = Object.entries(resource).reduce(
          (oldValue, newValue) => {
            return {
              ...oldValue,
              [newValue[0]]: convertValueToUnit(newValue[1], maxUnit),
            };
          },
          {}
        );

        return { timestamp: Number(timestamp), ...rolledUpData };
      }
    )
    .sort(
      (dimension1, dimension2) => dimension1.timestamp - dimension2.timestamp
    );
  return {
    areas,
    dimensions,
    legendRowsData,
    unit: maxUnit,
  };
};

/**
 *
 * @param legendRowsData list of legend rows available for the metric
 * @param unit base unit of the values
 * @returns maximum possible rolled up unit based on the unit
 */
const generateMaxUnit = (legendRowsData: MetricsDisplayRow[], unit: string) => {
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

/**
 * This method handles the existing issue in chart JS, and it will deleted when the recharts migration is completed
 * @param arraysToBeFilled The list of dimension data to be filled
 * @returns The list of dimension data filled with null values for missing timestamps
 */
// TODO: CloudPulse - delete when recharts migration completed
export const fillMissingTimeStampsAcrossDimensions = (
  ...arraysToBeFilled: [number, number | null][][]
): [number, number | null][][] => {
  if (arraysToBeFilled.length === 0) return [];

  // Step 1: Collect all unique keys from all arrays
  const allTimestamps = new Set<number>();

  // Collect timestamps from each array, array[0], contains the number timestamp
  arraysToBeFilled.forEach((array) => {
    array.forEach(([timeStamp]) => allTimestamps.add(timeStamp));
  });

  // Step 2: Sort the timestamps to maintain chronological order
  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

  // Step 3: Synchronize the arrays to have null values for all missing timestamps
  return arraysToBeFilled.map((array) => {
    // Step 3.1: Convert the array into a map for fast lookup
    const map = new Map(array.map(([key, value]) => [key, value]));

    // Step 3.2: Build the synchronized array by checking if a key exists
    return sortedTimestamps.map((key) => {
      // If the current array has the key, use its value; otherwise, set it to null, so that the gap is properly visible
      return [key, map.get(key) ?? null] as [number, number | null];
    });
  });
};
