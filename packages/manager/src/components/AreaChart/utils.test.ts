import { determinePower } from 'src/utilities/unitConversions';

import {
  getAccessibleTimestamp,
  humanizeLargeData,
  tooltipLabelFormatter,
  tooltipValueFormatter,
} from './utils';

import type { StorageSymbol } from 'src/utilities/unitConversions';

const timestamp = 1704204000000;

describe('getAccessibleTimestamp', () => {
  it('should return the time in a format like 10/14/2023, 9:30 AM', () => {
    expect(getAccessibleTimestamp(timestamp, 'America/New_York')).toBe(
      '1/2/2024, 9:00\u202fAM'
    );
  });
});

describe('tooltipLabelFormatter', () => {
  it('should return the time in a format like October 14, 2023, 9:30 AM', () => {
    expect(tooltipLabelFormatter(timestamp, 'America/New_York')).toBe(
      'Jan 2, 2024, 9:00\u202fAM'
    );
  });
});

describe('tooltipValueFormatter', () => {
  it('should return the rounded value up to a max of 2 decimals', () => {
    expect(tooltipValueFormatter(5.434939999999999, ' Kb/s')).toBe('5.43 Kb/s');
    expect(tooltipValueFormatter(5, ' Kb/s')).toBe('5 Kb/s');
    expect(tooltipValueFormatter(0.000234, '%')).toBe('0%');
  });
});

describe('humanizeLargeData', () => {
  it('should return the value as an abbreviated string if the value is >= 1000', () => {
    expect(humanizeLargeData(999)).toBe('999');
    expect(humanizeLargeData(1125)).toBe('1.1K');
    expect(humanizeLargeData(231434)).toBe('231.4K');
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
