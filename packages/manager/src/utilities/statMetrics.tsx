import { StatsData } from 'linode-js-sdk/lib/linodes';

export interface Metrics {
  max: number;
  average: number;
  last: number;
  total: number;
  length: number;
}

// Returns max, average, and last for RDD data from the API, which has this
// shape: [ [n1, n2], ... ], where n1 is unix-time in milliseconds and n2 is the
// value.
export const getMetrics = (data: number[][]): Metrics => {
  // If there's no data
  if (!data || !Array.isArray(data) || data.length < 1) {
    return { max: 0, average: 0, last: 0, total: 0, length: 0 };
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

  return { max, average, last, total: sum, length };
};

export const formatNumber = (n: number): string => n.toFixed(2);

// Applies SI Magnitude prefix.
// 1400 --> "1.40 K"
// 1400000 --> "1.40 M"
// 1400000000 --> "1.40 G"
export const formatMagnitude = (value: number | string, unit: string) => {
  const num = Number(value);

  const ranges = [
    { divider: 1e9, suffix: 'G' },
    { divider: 1e6, suffix: 'M' },
    { divider: 1e3, suffix: 'K' },
    { divider: 1, suffix: '' }
  ];

  let finalNum;
  let magnitude;

  // Use Array.prototype.some, because we might need to break this loop early.
  ranges.some(range => {
    if (num >= range.divider) {
      finalNum = num / range.divider;
      magnitude = range.suffix;
      return true;
    }
    return false;
  });

  return finalNum
    ? `${formatNumber(finalNum)} ${magnitude}${unit}`
    : `${formatNumber(num)} ${unit}`;
};

export const formatPercentage = (value: number) => formatNumber(value) + '%';
export const formatBitsPerSecond = (value: number) =>
  formatMagnitude(value, 'b/s');
export const formatBytes = (value: number) => formatMagnitude(value, 'B');

export const getTraffic = (averageInBits: number): number => {
  const averageInBytes = averageInBits / 8;
  const averageBytesOverDay = averageInBytes * (60 * 60 * 24); // 86400 seconds in 24 hours
  return averageBytesOverDay;
};

export interface TotalTrafficResults {
  inTraffic: number;
  outTraffic: number;
  combinedTraffic: number;
}
export const getTotalTraffic = (
  inBits: number,
  outBits: number,
  length: number,
  inBitsV6?: number,
  outBitsV6?: number
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
    inTraffic,
    outTraffic,
    combinedTraffic: inTraffic + outTraffic
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
