import { map } from 'ramda';

export interface MetricResults {
  max: number;
  average: number;
  last: number;
}

export const getMetrics = (data: number[][]): MetricResults => {

  let max = 0;
  let sum = 0
  let length = 0;
  let last = 0

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

export const formatNumber = (num: number): any => {
  const rounded = Math.round(num * 100) / 100;
  return rounded.toFixed(2);
}

export const objectMap = (obj: any, fn: any) => {
  return Object.keys(obj).map((key) => {
    obj[key] = fn(obj[key]);
  });
}

export const formatPercentage = (value: string) => value + '%';
export const withPercentage = map(formatPercentage) as any;


export const addUnit = (value: string) => {
  const num = Number(value);
  if (num >= 1000) {
    return formatNumber(num/1000) + ' kb/s';
  } else {
    return num + ' b/s';
  }
}
export const withUnit = map(addUnit) as any;