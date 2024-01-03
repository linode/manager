import {
  getAccessibleTimestamp,
  tooltipLabelFormatter,
  tooltipValueFormatter,
} from './utils';

const timestamp = 1704204000000;

describe('getAccessibleTimestamp', () => {
  it('should return the time in a format like 10/14/2023, 9:30 AM', () => {
    expect(getAccessibleTimestamp(timestamp)).toEqual('1/2/2024, 9:00\u202fAM');
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
