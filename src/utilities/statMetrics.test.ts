import { appendBitrateUnit, formatNumber, getMetrics, withPercentSign } from './statMetrics';

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
    expect(metrics.max).toBe('2.98');
    const newData = [...data, [0, 100]];
    expect(getMetrics(newData).max).toBe('100.00');
    expect(getMetrics([[0, 0], [0, 0]]).max).toBe('0.00');
  });

  it('returns average', () => {
    expect(metrics.average).toBe('1.01');
    expect(getMetrics([[0, 0]]).average).toBe('0.00');
    expect(getMetrics([[0, 0], [0, 0]]).average).toBe('0.00');
    expect(getMetrics([[0, 0], [0, 1]]).average).toBe('1.00');
    expect(getMetrics([[0, 0], [0, 100], [0, 100]]).average).toBe('100.00');
  });

  it('returns last', () => {
    expect(metrics.last).toBe('1.20');
    let newData = [...data, [0, 0]];
    expect(getMetrics(newData).last).toBe('1.20');
    newData = [...data, [0, 50]];
    expect(getMetrics(newData).last).toBe('50.00');
  });
});

describe('add unit', () => {
  it('returns bit/s if less than 1000', () => {
    expect(appendBitrateUnit('612.12')).toBe('612.12 bit/s');
    expect(appendBitrateUnit('1024')).not.toBe('1000.24 bit/s');
  });

  it('converts to Kbit/s if 1000 or greater', () => {
    expect(appendBitrateUnit('6211.21')).toBe('6.21 Kbit/s');
    expect(appendBitrateUnit('1000')).toBe('1.00 Kbit/s');
  });

  it('converts to Mbit/s if 1000 * 1000 or greater', () => {
    expect(appendBitrateUnit('62232111.21')).toBe('62.23 Mbit/s');
    expect(appendBitrateUnit('1000000')).toBe('1.00 Mbit/s');
  });

  it('converts to Gbit/s if 1000 * 1000 * 1000 or greater', () => {
    expect(appendBitrateUnit('62331232111.21')).toBe('62.33 Gbit/s');
    expect(appendBitrateUnit('1000000000')).toBe('1.00 Gbit/s');
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

  it('with percentage', () => {
    let initial = {a: '1.00', b: '2.50'};
    let expected = {a: '1.00%', b: '2.50%'};
    expect(withPercentSign(initial)).toEqual(expected);

    initial = {a: '0.00', b: '2'};
    expected = {a: '0.00%', b: '2%'}
    expect(withPercentSign(initial)).toEqual(expected);
  });
});