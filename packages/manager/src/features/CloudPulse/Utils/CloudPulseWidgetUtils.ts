import { Alias } from '@linode/design-language-system';
import { getMetrics } from '@linode/utilities';

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
import type {
  CloudPulseMetricsList,
  CloudPulseMetricsRequest,
  CloudPulseMetricsResponse,
  DateTimeWithPreset,
  TimeDuration,
  Widgets,
} from '@linode/api-v4';
import type { Theme } from '@mui/material';
import type { DataSet } from 'src/components/AreaChart/AreaChart';
import type { AreaProps } from 'src/components/AreaChart/AreaChart';
import type { MetricsDisplayRow } from 'src/components/LineGraph/MetricsDisplay';

interface LabelNameOptionsProps {
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
   * unit of the data
   */
  unit: string;
}

interface GraphDataOptionsProps {
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
   * status returned from react query ( pending | error | success)
   */
  status: 'error' | 'pending' | 'success';

  /**
   * unit of the data
   */
  unit: string;
}

interface MetricRequestProps {
  /**
   * time duration for the metrics data
   */
  duration: DateTimeWithPreset;

  /**
   * entity ids selected by user
   */
  entityIds: string[];

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
  const { label, metricsList, resources, status, unit } = props;
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
          label,
          metric: transformedData.metric,
          resources,
          unit,
        };
        const labelName = getLabelName(labelOptions);
        const data = seriesDataFormatter(transformedData.values, start, end);
        const color = colors[index % 22].Primary;
        areas.push({
          color,
          dataKey: labelName,
        });

        // map each label & its data point to its timestamp
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
export const generateMaxUnit = (
  legendRowsData: MetricsDisplayRow[],
  unit: string
) => {
  const maxValue = Math.max(
    0,
    ...legendRowsData.map((row) => row?.data.max ?? 0)
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
  const { duration, entityIds, resources, widget } = props;
  const preset = duration.preset;

  return {
    absolute_time_duration:
      preset !== 'custom_range' &&
      preset !== 'this_month' &&
      preset !== 'last_month'
        ? undefined
        : { end: duration.end, start: duration.start },
    entity_ids: resources
      ? entityIds.map((id) => parseInt(id, 10))
      : widget.entity_ids.map((id) => parseInt(id, 10)),
    filters: undefined,
    group_by: widget.group_by,
    relative_time_duration: getTimeDurationFromPreset(preset),
    metrics: [
      {
        aggregate_function: widget.aggregate_function,
        name: widget.metric,
      },
    ],
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
export const getLabelName = (props: LabelNameOptionsProps): string => {
  const { label, metric, resources, unit } = props;
  // aggregated metric, where metric keys will be 0
  if (!Object.keys(metric).length) {
    // in this case return widget label and unit
    return `${label} (${unit})`;
  }

  return getDimensionName({ metric, resources });
};

/**
 *
 * @returns generated dimension name based on resources
 */
// ... existing code ...
export const getDimensionName = (props: DimensionNameProperties): string => {
  const { metric, resources } = props;
  return Object.entries(metric)
    .map(([key, value]) => {
      if (key === 'entity_id') {
        return mapResourceIdToName(value, resources);
      }

      return value ?? '';
    })
    .filter(Boolean)
    .join(' | ');
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
 *
 * @param preset preset for time duration to get the corresponding time duration object
 * @returns time duration object for the label
 */
export const getTimeDurationFromPreset = (
  preset?: string
): TimeDuration | undefined => {
  switch (preset) {
    case '30minutes':
      return { unit: 'min', value: 30 };
    case '1hour':
      return { unit: 'hr', value: 1 };
    case '24hours':
      return { unit: 'hr', value: 24 };
    case '12hours':
      return { unit: 'hr', value: 12 };
    case '7days':
      return { unit: 'days', value: 7 };
    case '30days':
      return { unit: 'days', value: 30 };
    default:
      return undefined;
  }
};
