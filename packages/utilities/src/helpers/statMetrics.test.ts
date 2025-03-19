import { describe, expect, it } from 'vitest';

import {
  formatNumber,
  formatPercentage,
  getMetrics,
  getTotalTraffic,
} from './statMetrics';

const data = [
  [0, 0.12],
  [0, 0.04],
  [0, 2.98],
  [0, 0],
  [0, 0.7],
  [0, 1.2],
  [0, 0],
  [0, 0],
];

describe('Stat Metrics', () => {
  const metrics = getMetrics(data);

  it('returns max', () => {
    expect(metrics.max).toBe(2.98);
    const newData = [...data, [0, 100]];
    expect(getMetrics(newData).max).toBe(100.0);
    expect(
      getMetrics([
        [0, 0],
        [0, 0],
      ]).max
    ).toBe(0);
  });

  it('returns average', () => {
    expect(metrics.average).toBe(0.63);
    expect(getMetrics([[0, 0]]).average).toBe(0);
    expect(
      getMetrics([
        [0, 0],
        [0, 0],
      ]).average
    ).toBe(0);
    expect(
      getMetrics([
        [0, 0],
        [0, 1],
      ]).average
    ).toBe(0.5);
    expect(
      getMetrics([
        [0, 0],
        [0, 3],
        [0, 12],
      ]).average
    ).toBe(5);
  });

  it('returns last', () => {
    expect(metrics.last).toBe(0);
    expect(getMetrics([...data, [0, 8]]).last).toBe(8);
  });

  it('does not crash with unexpected inputs', () => {
    const emptyResponse = { average: 0, last: 0, length: 0, max: 0, total: 0 };
    expect(getMetrics([])).toEqual(emptyResponse);
    expect(getMetrics(undefined as any)).toEqual(emptyResponse);
    expect(getMetrics(null as any)).toEqual(emptyResponse);
    expect(getMetrics(12 as any)).toEqual(emptyResponse);
    expect(getMetrics('hello' as any)).toEqual(emptyResponse);
    expect(getMetrics({} as any)).toEqual(emptyResponse);
    expect(getMetrics([[], []] as any)).toEqual({
      average: 0,
      last: 0,
      length: 2,
      max: 0,
      total: 0,
    });
    expect(getMetrics([[], ['hello']] as any)).toEqual({
      average: 0,
      last: 0,
      length: 2,
      max: 0,
      total: 0,
    });
    expect(getMetrics([[], ['hello', 3]] as any)).toEqual({
      average: 1.5,
      last: 3,
      length: 2,
      max: 3,
      total: 3,
    });
    expect(
      getMetrics([
        [3, 'hello'],
        ['hello', 3],
      ] as any)
    ).toEqual({
      average: 1.5,
      last: 3,
      length: 2,
      max: 3,
      total: 3,
    });
  });
});

describe('total traffic', () => {
  it('returns total traffic given the average', () => {
    const totalTraffic = getTotalTraffic(1, 2, 2);
    expect(totalTraffic.inTraffic).toBe(5400);
    expect(totalTraffic.outTraffic).toBe(10800);
    expect(totalTraffic.combinedTraffic).toBe(16200);
    expect(totalTraffic.combinedTraffic).toEqual(
      totalTraffic.inTraffic + totalTraffic.outTraffic
    );
  });
});

describe('format number', () => {
  it('always returns two decimal places', () => {
    expect(formatNumber(24)).toBe('24.00');
    expect(formatNumber(0)).toBe('0.00');
    expect(formatNumber(110)).toBe('110.00');
    expect(formatNumber(92.078)).toBe('92.08');
    expect(formatNumber(10000.07)).toBe('10000.07');
    expect(formatNumber(99.99)).toBe('99.99');
    expect(formatNumber(99.999)).toBe('100.00');
    expect(formatNumber(99.7)).toBe('99.70');
  });
});

describe('formatting', () => {
  it('formatPercent adds percent sign', () => {
    expect(formatPercentage(12)).toBe('12.00 %');
    expect(formatPercentage(0)).toBe('0.00 %');
    expect(formatPercentage(123456789)).toBe('123456789.00 %');
  });
});
