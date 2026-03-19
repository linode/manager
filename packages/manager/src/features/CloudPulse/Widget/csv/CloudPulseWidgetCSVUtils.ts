import { DateTime } from 'luxon';

import { DIMENSION_TRANSFORM_CONFIG } from '../../shared/DimensionTransform';
import { convertStringToCamelCasesWithSpaces } from '../../Utils/utils';

import type { FilterData } from '../../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseServiceTypeFilterMap } from '../../Utils/models';
import type { MetricsDimensionFilter } from '../components/DimensionFilters/types';
import type {
  CloudPulseServiceType,
  DateTimeWithPreset,
  Dimension,
  Widgets,
} from '@linode/api-v4';
import type { DataSet } from 'src/components/AreaChart/AreaChart';

export interface CSVDataProps {
  /**
   * The name of the dashboard for which the widget data is being downloaded
   */
  dashboardName: string;
  /**
   * The data points for the widget, typically an array of objects with timestamp and value keys
   */
  data: DataSet[];
  /**
   * The dimension filters applied on the widget data
   */
  dimensionFilters: MetricsDimensionFilter[];
  /**
   * The list of available dimensions for the selected metric, used to map dimension labels to user-friendly names
   */
  dimensionOptions: Dimension[];
  /**
   * The duration for which the data is being downloaded, including start and end times and the time zone
   */
  duration: DateTimeWithPreset;
  /**
   * The filter data applied on the widget, including label filters and other types of filters
   */
  filterConfig: CloudPulseServiceTypeFilterMap;
  /**
   * The filters applied on the widget, used to extract the applied filter values for the CSV
   */
  filters: FilterData | undefined;
  /**
   * The group by options applied on the widget, used to include the group by information in the CSV
   */
  groupBy: string[];
  /**
   * Indicates whether the widget data is still loading, used to determine whether to enable the CSV download functionality
   */
  isDataLoading: boolean;
  /**
   * The service type of the widget, used to apply any service-specific transformations to dimension filter values and labels in the CSV
   */
  serviceType: CloudPulseServiceType;
  /**
   * The widget for which the CSV is being generated, used to extract information such as the metric label, unit, aggregation function, and scrape interval to include in the CSV
   */
  widget: Widgets;
  /**
   * The zoom range boundaries (left and right timestamps) if the chart is zoomed, used to filter the data to only include the zoomed range in the CSV
   */
  zoomRange?: {
    left: 'dataMin' | number;
    right: 'dataMax' | number;
  };
}

type CSVRow = Array<number | string>;
type CSVData = CSVRow[];

/**
 * @param iso The ISO string to be formatted, typically representing a date and time value such as the start or end time of the data duration for the widget
 * @param timeZone The time zone to be applied when formatting the ISO string, used to ensure that the date and time values in the CSV are presented in the user's local time zone for better readability and relevance
 * @returns The formatted date and time string in the specified time zone
 */
const formatDateTime = (iso: string, timeZone: string | undefined) => {
  const dateTime = DateTime.fromISO(iso).setZone(timeZone);
  return `${dateTime.toLocaleString(DateTime.DATETIME_MED)} ${dateTime.offsetNameShort}`;
};
/**
 * @param millis The timestamp to be formatted in milliseconds
 * @param timeZone The time zone to be applied while formatting the timestamp
 * @returns The formatted data and time string in specified time zone
 */
const formatTimestamp = (millis: number, timeZone: string | undefined) => {
  const dateTime = DateTime.fromMillis(millis).setZone(timeZone);
  return dateTime.toLocaleString(DateTime.DATETIME_MED);
};
/**
 * @param dimensions The dimensions to be transformed into a map of dimension label to dimension name, used to create a mapping of dimension labels to user-friendly names for better readability in the CSV
 * @returns The map of dimension label to dimension name, used to look up user-friendly names for dimension labels when generating the CSV data
 */
const buildDimensionLabelMap = (dimensions: Dimension[]) =>
  dimensions.reduce<Record<string, string>>((acc, dimension) => {
    acc[dimension.dimension_label] = dimension.label;
    return acc;
  }, {});
/**
 * @param dimensionFilters The dimension filters applied on the widget, used to extract the dimension filter information to include in the CSV
 * @param dimensionOptions The list of available dimensions for the selected metric, used to map dimension labels to user-friendly names in the CSV
 * @param serviceType The service type of the widget, used to apply any service-specific transformations to dimension filter values and labels in the CSV
 * @returns The formatted dimension filter string to be included in the CSV, typically in the format of "Dimension Label, Operator, Value; Dimension Label, Operator, Value" for multiple dimension filters, with user-friendly dimension labels and transformed values based on the service type for better readability and relevance in the CSV
 */
const buildDimensionFilterString = (
  dimensionFilters: MetricsDimensionFilter[],
  dimensionOptions: Dimension[],
  serviceType: CloudPulseServiceType
): string => {
  if (!dimensionFilters.length) return '';

  const labelMap = buildDimensionLabelMap(dimensionOptions);

  return dimensionFilters
    .map((filter) => {
      if (filter.dimension_label) {
        const label = labelMap[filter.dimension_label] ?? '';
        const transformer =
          DIMENSION_TRANSFORM_CONFIG[serviceType]?.[filter.dimension_label];

        const value = transformer?.(filter.value ?? '') ?? filter.value ?? '';

        return `${label},${filter.operator},${value}`;
      }
      return undefined;
    })
    .filter((value) => value !== undefined)
    .join(';');
};

/**
 * @param csvData The existing CSV data array to which the applied filters will be appended, used to build the complete CSV data including the applied filters information
 * @param filters The filters applied on the widget, used to extract the filter information to include in the CSV
 * @param filterConfig The configuration of the filters for the service type, used to map filter keys to user-friendly names in the CSV
 * @returns The updated CSV data array with the applied filters appended, used to build the complete CSV data including the applied filters information
 */
const appendAppliedFilters = (
  csvData: CSVData,
  filters: FilterData,
  filterConfig: CloudPulseServiceTypeFilterMap
) => {
  if (!filters?.label) return;

  const appliedFilters = filterConfig.filters
    .filter(({ configuration }) =>
      Boolean(filters.label[configuration.filterKey]?.length)
    )
    .map(({ configuration }) => {
      const labelValue = filters.label[configuration.filterKey];
      return [
        configuration.name,
        Array.isArray(labelValue) ? labelValue.join(', ') : labelValue,
      ];
    });

  csvData.push(...appliedFilters);

  if (appliedFilters.length) {
    csvData.push([]);
  }
};
/**
 * @param props The properties required to generate the CSV data for a CloudPulse widget, including the dashboard name, widget data, applied filters, group by options, and other relevant information needed to build a comprehensive CSV representation of the widget data
 * @returns The generated CSV data for the CloudPulse widget, including header information, applied filters, group by details, aggregation function, scrape interval, dimension filters, metric information, and the actual data points
 */
export const generateCSVData = ({
  dashboardName,
  data,
  duration,
  filters,
  widget,
  filterConfig,
  groupBy,
  dimensionFilters,
  dimensionOptions,
  serviceType,
  zoomRange,
}: CSVDataProps): CSVData => {
  const csvData: CSVData = [];
  // Filter data based on zoom range if zoom is active
  const filteredData =
    zoomRange?.left && zoomRange?.right
      ? data.filter(
          ({ timestamp }) =>
            (typeof zoomRange.left === 'number' &&
              typeof zoomRange.right === 'number' &&
              timestamp >= zoomRange.left &&
              timestamp <= zoomRange.right) ||
            (zoomRange.left === 'dataMin' && zoomRange.right === 'dataMax') // Include all data if zoom range is set to dataMin/dataMax
        )
      : data;
  // Header
  csvData.push(['Dashboard', dashboardName]);
  if (duration.preset && duration.preset !== 'Reset') {
    csvData.push(['Time Range', duration.preset]);
  } else {
    // Use actual data timestamps for presets, duration values for custom ranges
    const startTime = formatDateTime(duration.start, duration.timeZone);

    const endTime = formatDateTime(duration.end, duration.timeZone);

    csvData.push(['Start Time', startTime]);
    csvData.push(['End Time', endTime]);
  }
  csvData.push([]);
  // Filters
  if (filters) {
    appendAppliedFilters(csvData, filters, filterConfig);
  }
  // Scrape Interval
  if (widget.time_granularity) {
    const { value, unit } = widget.time_granularity;
    const intervalValue =
      value === -1 && unit === 'Auto' ? unit : `${value} ${unit}`;
    csvData.push(['Data Aggregation Interval', intervalValue]);
  }
  // Aggregation
  if (widget.aggregate_function) {
    csvData.push([
      'Aggregation Function',
      convertStringToCamelCasesWithSpaces(widget.aggregate_function),
    ]);
  }
  // Group By
  if (groupBy.length) {
    csvData.push(['Group By', groupBy.join(', ')]);
  }
  // Dimension Filters
  const dimensionFilterString = buildDimensionFilterString(
    dimensionFilters,
    dimensionOptions,
    serviceType
  );

  if (dimensionFilterString) {
    csvData.push(['Dimension Filters', dimensionFilterString]);
  }
  // Metric Info
  csvData.push(['Metric', widget.label]);
  csvData.push(['Unit', widget.unit]);

  if (
    zoomRange &&
    zoomRange.left !== 'dataMin' &&
    zoomRange.right !== 'dataMax'
  ) {
    csvData.push([
      'Zoom Start Time',
      formatTimestamp(zoomRange.left, duration.timeZone),
    ]);
    csvData.push([
      'Zoom End Time',
      formatTimestamp(zoomRange.right, duration.timeZone),
    ]);
  }
  csvData.push([]);
  // Data
  if (filteredData.length) {
    // Collect all unique keys across all data points (timestamp is always present)
    const metricKeys = new Set<string>();
    filteredData.forEach((dataPoint) => {
      Object.keys(dataPoint).forEach((key) => {
        if (key !== 'timestamp') {
          metricKeys.add(key);
        }
      });
    });
    // Build final keys array: timestamp first, then sorted metric keys
    const offsetNameShort = DateTime.fromMillis(
      filteredData[0].timestamp
    ).setZone(duration.timeZone).offsetNameShort;

    const timeHeader = `time (${offsetNameShort})`;
    const sortedKeys = [timeHeader, ...Array.from(metricKeys).sort()];

    csvData.push(sortedKeys);
    csvData.push([]);

    filteredData.forEach((dataPoint) => {
      const row: CSVRow = sortedKeys.map((key) =>
        key === timeHeader
          ? formatTimestamp(dataPoint.timestamp, duration.timeZone)
          : (dataPoint[key] ?? '')
      );

      csvData.push(row);
    });
  }
  return csvData;
};
