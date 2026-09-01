import {
  formatDateTime,
  formatTimestamp,
} from './csv/CloudPulseWidgetCSVUtils';

import type {
  CloudPulseMetricsResponse,
  DateTimeWithPreset,
} from '@linode/api-v4';
import type { ChartData } from 'src/components/SingleKpiChart';

/**
 * Calculates aggregated values based on the provided aggregate function.
 * @param data - The chart data to aggregate.
 * @param aggFunction - The aggregation function to apply (e.g., 'avg', 'max', 'min', 'sum').
 */
export const calculateAggregatedValue = (
  data: ChartData[] | undefined,
  aggFunction?: string
): number => {
  if (!data || data.length === 0) {
    return 0;
  }

  const fn = aggFunction?.toLowerCase();

  switch (fn) {
    case 'avg': {
      const sum = data.reduce((acc, curr) => acc + (curr.value ?? 0), 0);
      return sum / data.length;
    }

    case 'max': {
      return data.reduce((max, curr) => {
        const val = curr.value ?? -Infinity;
        return val > max ? val : max;
      }, -Infinity);
    }

    case 'min': {
      return data.reduce((min, curr) => {
        const val = curr.value ?? Infinity;
        return val < min ? val : min;
      }, Infinity);
    }

    case 'sum':
    default:
      return data.reduce((acc, curr) => acc + (curr.value ?? 0), 0);
  }
};

/**
 * Formats period display label according to duration presets and data bounds.
 * @param duration - The duration object containing preset and time range information.
 * @param data - The chart data to determine the start and end timestamps.
 */
export const getWidgetPeriodLabel = (
  duration: DateTimeWithPreset,
  data: ChartData[]
): string => {
  if (duration.preset !== 'Reset') {
    return duration.preset ?? 'Custom';
  }

  if (data && data.length > 0) {
    const startFormatted = formatTimestamp(
      data[0].timestamp * 1000,
      duration.timeZone
    );
    const endFormatted = formatTimestamp(
      data[data.length - 1].timestamp * 1000,
      duration.timeZone
    );
    return `${startFormatted} - ${endFormatted}`;
  }

  return `${formatDateTime(duration.start, duration.timeZone, false)} - ${formatDateTime(duration.end, duration.timeZone, false)}`;
};

export const isCloudPulseMetricsResponse = (
  response: unknown
): response is CloudPulseMetricsResponse => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'status' in response &&
    typeof response.status === 'string' &&
    'isPartial' in response &&
    typeof response.isPartial === 'boolean' &&
    'data' in response &&
    typeof response.data === 'object' &&
    response.data !== null &&
    'result' in response.data &&
    Array.isArray(response.data.result)
  );
};
