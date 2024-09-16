import {
  granularity,
  timeRange,
} from '../../cypress/support/constants/widgets';

import type { CloudPulseMetricsResponse } from '@linode/api-v4';

/**
 * Generates a mock metric response based on the specified time range and granularity.
 *
 * This function:
 * 1. Determines the time interval based on the granularity (e.g., 5 minutes, 1 hour, 1 day).
 * 2. Calculates the time range in seconds based on the specified time range (e.g., last 12 hours, last 30 days).
 * 3. Creates a series of random metric values for the given time range at the specified interval.
 * 4. Returns a mock response object containing the generated metric data.
 *
 * @param {string} time - The time range for the metric data (e.g., "Last12Hours").
 * @param {string} granularityData - The granularity of the metric data (e.g., "Min5").
 * @returns {CloudPulseMetricsResponse} - The generated mock metric response.
 */
export const createMetricResponse = (
  time: string,
  granularityData: string
): CloudPulseMetricsResponse => {
  const currentTime = Math.floor(Date.now() / 1000);

  const intervals: Record<string, number> = {
    [granularity.Auto]: 3600,
    [granularity.Day1]: 86400,
    [granularity.Hour]: 3600,
    [granularity.Minutes]: 5 * 60,
  };

  const timeRanges: Record<string, number> = {
    [timeRange.Last7Days]: 7 * 24 * 3600,
    [timeRange.Last12Hours]: 12 * 3600,
    [timeRange.Last24Hours]: 24 * 3600,
    [timeRange.Last30Days]: 30 * 24 * 3600,
    [timeRange.Last30Minutes]: 30 * 60,
  };

  const interval =
    intervals[granularityData] ||
    (() => {
      throw new Error(`Unsupported granularity: ${granularityData}`);
    })();
  const timeRangeInSeconds =
    timeRanges[time] ||
    (() => {
      throw new Error(`Unsupported time range: ${time}`);
    })();
  const startTime = currentTime - timeRangeInSeconds;

  const values: [number, string][] = Array.from(
    { length: Math.ceil(timeRangeInSeconds / interval) + 1 },
    (_, i) => {
      const timestamp = startTime + i * interval;
      const value = (Math.round(Math.random() * 100 * 100) / 100).toFixed(2); // Round and convert to string with 2 decimal places
      return [timestamp, value];
    }
  );

  return {
    data: {
      result: [{ metric: {}, values }],
      result_type: 'matrix',
    },
    isPartial: false,
    stats: {
      series_fetched: 53,
    },
    status: 'success',
  };
};