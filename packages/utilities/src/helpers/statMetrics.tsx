import type { StatsData } from '@linode/api-v4/lib/linodes';

export interface Metrics {
  average: number;
  last: number;
  length: number;
  max: number;
  total: number;
}

// Returns max, average, and last for RDD data from the API, which has this
// shape: [ [n1, n2], ... ], where n1 is unix-time in milliseconds and n2 is the
// value.
export const getMetrics = (data: number[][]): Metrics => {
  // If there's no data
  if (!data || !Array.isArray(data) || data.length < 1) {
    return { average: 0, last: 0, length: 0, max: 0, total: 0 };
  }

  let max = 0;
  let sum = 0;

  // The data is large, so we get everything we need in one iteration
  data.forEach(([_, value]: number[], idx): void => {
    if (!value || isNaN(value)) {
      return;
    }

    if (value > max) {
      max = value;
    }

    sum += value;
  });

  const length = data.length;

  // Safeguard against dividing by 0
  const average = length > 0 ? sum / length : 0;

  const last = data[length - 1][1] || 0;

  return { average, last, length, max, total: sum };
};

export const formatNumber = (n: number): string => n.toFixed(2);

export const formatPercentage = (value: number) => formatNumber(value) + ' %';

export const getTraffic = (averageInBits: number): number => {
  const averageInBytes = averageInBits / 8;
  // eslint-disable-next-line
  const averageBytesOverDay = averageInBytes * (60 * 60 * 24); // 86400 seconds in 24 hours
  return averageBytesOverDay;
};

export interface TotalTrafficResults {
  combinedTraffic: number;
  inTraffic: number;
  outTraffic: number;
}
export const getTotalTraffic = (
  inBits: number,
  outBits: number,
  length: number,
  inBitsV6?: number,
  outBitsV6?: number,
): TotalTrafficResults => {
  if (inBitsV6) {
    inBits += inBitsV6;
  }

  if (outBitsV6) {
    outBits += outBitsV6;
  }

  const averageIn = inBits / length;
  const averageOut = outBits / length;

  const inTraffic = getTraffic(averageIn);
  const outTraffic = getTraffic(averageOut);

  return {
    combinedTraffic: inTraffic + outTraffic,
    inTraffic,
    outTraffic,
  };
};

export const getMonthlyTraffic = (stats: StatsData) => {
  const getTrafficSum = (records: number[][]) =>
    records.reduce((acc, record) => {
      return acc + record[1];
    }, 0);

  return (
    getTrafficSum(stats.netv4.in) +
    getTrafficSum(stats.netv4.out) +
    getTrafficSum(stats.netv6.in) +
    getTrafficSum(stats.netv4.out)
  );
};
