import { isEmpty, map } from 'ramda';

export interface MetricResults {
  max: string;
  average: string;
  last: string;
}

// Returns max, average, and last for stats data from the API, which has this
// shape: [ [n1, n2], ... ] where n1 is unix-time in milliseconds and n2 is the
// value. We ignore values of 0. We return strings instead of numbers, because
// we always want a fixed number of decimal points (2).
export const getMetrics = (data: number[][]): MetricResults => {
  if (isEmpty(data[0])) {
    return map(formatNumber, {max: 0, average: 0, last: 0});
  }

  let max = 0;
  let sum = 0
  let length = 0; // Number of non-zero elements
  let last = 0; // Last non-zero element

  // The data is large, so we get everything we need in one forEach.
  data.forEach(([timestamp, value]: number[], idx): void => {

    // Ignore '0' values
    if (value === 0) {
      return;
    }

    if (value > max) {
      max = value;
    }

    last = value;
    sum += value;
    length++;
  });


  // Safeguard against dividing by 0
  const average = length > 0
  ? sum/length
  : 0;

  return map(formatNumber, { max, average, last });
}

export const formatNumber = (num: number): string => {
  return num.toFixed(2);
}


export const appendPercentSign = (value: string) => value + '%';

// Function that applies addPercentSign to each value in a collection
export const withPercentSign = map(appendPercentSign) as any; // I can't get the typing right on this

// Appends a "friendly" unit of measurement – bit/s, Kbit/s, Mbit/s, Gbit/s
// Will make appropriate division, e.g. appendFriendlyBitrateUnit(1000) --> 1.00 Kbit/s
export const appendBitrateUnit = (valueInBits: string | number) => {
  const num = Number(valueInBits);

  const Kbit = 1000;
  const Mbit = 1000 * Kbit;
  const Gbit = 1000 * Mbit;

  let divisor = 1;
  let unit = 'bit/s';

  if (num >= Gbit) {
    divisor = Gbit;
    unit = 'Gbit/s';
  } else if (num >= Mbit) {
    divisor = Mbit;
    unit = 'Mbit/s';
  } else if (num >= Kbit) {
    divisor = Kbit;
    unit = 'Kbit/s';
  }

  return formatNumber(num/divisor) + ' ' + unit;
}
export const withBitrate = map(appendBitrateUnit) as any; // Map is hard to type...