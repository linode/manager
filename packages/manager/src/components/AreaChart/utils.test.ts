import { determinePower } from '@linode/utilities';

import {
  generate12HourTicks,
  getAccessibleTimestamp,
  humanizeLargeData,
  tooltipLabelFormatter,
  tooltipValueFormatter,
} from './utils';

import type { DataSet } from './AreaChart';
import type { StorageSymbol } from '@linode/utilities';

const timestamp = 1704204000000;

describe('getAccessibleTimestamp', () => {
  it('should return the time in a format like 10/14/2023, 9:30 AM', () => {
    const result = getAccessibleTimestamp(timestamp, 'America/New_York');
    expect(result.replace(/\u202F/g, ' ')).toBe('1/2/2024, 9:00 AM');
  });
});

describe('tooltipLabelFormatter', () => {
  it('should return the time in a format like October 14, 2023, 9:30 AM', () => {
    const label = tooltipLabelFormatter(timestamp, 'America/New_York');
    const normalizedLabel = label.replace(/\u202F/g, ' ');
    expect(normalizedLabel).toBe('Jan 2, 2024, 9:00 AM');
  });
});

describe('tooltipValueFormatter', () => {
  it('should return the rounded value up to a max of 2 decimals', () => {
    expect(tooltipValueFormatter(5.434939999999999, 'Kb/s')).toBe('5.43 Kb/s');
    expect(tooltipValueFormatter(5, 'Kb/s')).toBe('5 Kb/s');
    expect(tooltipValueFormatter(0.000234, '%')).toBe('0 %');
  });
});

describe('humanizeLargeData', () => {
  it('should return the value as an abbreviated string if the value is >= 1000', () => {
    expect(humanizeLargeData(999)).toBe('999');
    expect(humanizeLargeData(1125)).toBe('1.1K');
    expect(humanizeLargeData(55555)).toBe('55.6K');
    expect(humanizeLargeData(231434)).toBe('231K');
    expect(humanizeLargeData(1010000)).toBe('1M');
    expect(humanizeLargeData(12345678900)).toBe('12.3B');
    expect(humanizeLargeData(1543212345678)).toBe('1.5T');
  });
});

describe('determinePower', () => {
  it('should return the correct power', () => {
    const storageUnits: StorageSymbol[] = ['bytes', 'KB', 'MB', 'GB', 'TB'];
    expect(
      determinePower(5187703696998400, storageUnits, {
        maxUnit: 'TB',
      })
    ).toBe(4);
    expect(
      determinePower(95509904120.832, storageUnits, {
        maxUnit: 'TB',
      })
    ).toBe(3);
    expect(
      determinePower(64823296, storageUnits, {
        maxUnit: 'TB',
      })
    ).toBe(2);
    expect(
      determinePower(1024, storageUnits, {
        maxUnit: 'TB',
      })
    ).toBe(1);
  });
});

describe('generate x-axis ticks', () => {
  const data: DataSet[] = [
    { label: 0.3744841110560275, timestamp: 1721854379 },
    { label: 0.4980357104166823, timestamp: 1721857979 },
    { label: 0.3290476561287732, timestamp: 1721861579 },
    { label: 0.4214879396496189, timestamp: 1721865179 },
    { label: 0.2269247326830727, timestamp: 1721868779 },
    { label: 0.3393055885526987, timestamp: 1721872379 },
    { label: 0.5237102833940027, timestamp: 1721875979 },
  ];
  it('should return empty x-axis tick list', () => {
    const ticks = generate12HourTicks(data, 'GMT', 0);
    expect(ticks.length).toBe(0);
  });

  it('should return 7 x-axis tick', () => {
    const ticks = generate12HourTicks(data, 'GMT', 7);
    expect(ticks.length).toBe(7);
  });
});
