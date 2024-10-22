// Function to generate random values based on the number of points

import type { CloudPulseMetricsResponseData } from '@linode/api-v4';
import type { Labels } from 'src/features/CloudPulse/shared/CloudPulseTimeRangeSelect';

export const generateRandomMetricsData = (
  time: Labels,
  granularityData: '1 day' | '1 hr' | '5 min' | 'Auto'
): CloudPulseMetricsResponseData => {
  const currentTime = Math.floor(Date.now() / 1000);

  const intervals: Record<string, number> = {
    ['1 day']: 86400,
    ['1 hr']: 3600,
    ['5 min']: 5 * 60,
    ['Auto']: 3600,
  };

  const timeRanges: Record<string, number> = {
    ['Last 7 Days']: 7 * 24 * 3600,
    ['Last 12 Hours']: 12 * 3600,
    ['Last 24 Hours']: 24 * 3600,
    ['Last 30 Days']: 30 * 24 * 3600,
    ['Last 30 Minutes']: 30 * 60,
  };

  const interval = intervals[granularityData];
  const timeRangeInSeconds = timeRanges[time];
  const startTime = currentTime - timeRangeInSeconds;

  if (!timeRangeInSeconds) {
    throw new Error(`Unsupported time range: ${time}`);
  }

  if (!interval) {
    throw new Error(`Unsupported interval: ${interval}`);
  }

  const values: [number, string][] = Array.from(
    { length: Math.ceil(timeRangeInSeconds / interval) + 1 },
    (_, i) => {
      const timestamp = startTime + i * interval;
      const value = (Math.round(Math.random() * 100 * 100) / 100).toFixed(2); // Round and convert to string with 2 decimal places
      return [timestamp, value];
    }
  );
  return {
    result: [{ metric: {}, values }],
    result_type: 'matrix',
  };
};
