import { DateTime } from 'luxon';

import {
  getOffsetFromDate,
  parseMonthOffset,
  sumPublicOutboundTraffic,
} from './TransferHistory';

import type { Stats } from '@linode/api-v4/lib/linodes';

describe('combineGraphData', () => {
  const netStats: Stats['data']['netv4'] = {
    in: [],
    out: [
      [1, 100],
      [1, 200],
      [1, 300],
    ],
    private_in: [],
    private_out: [],
  };

  const stats: Stats = {
    data: {
      cpu: [],
      io: { io: [], swap: [] },
      netv4: netStats,
      netv6: netStats,
    },
    title: 'Mock Stats',
  };

  it('sums  public outbound v4 and v6 data', () => {
    expect(sumPublicOutboundTraffic(stats)).toEqual([
      [1, 200],
      [1, 400],
      [1, 600],
    ]);
  });
});

const now = DateTime.fromISO('2020-07-01T12:00:00');

describe('parseMonthOffset', () => {
  it('returns the current year and month with an offset of 0', () => {
    const { humanizedDate, longHumanizedDate, month, year } = parseMonthOffset(
      0,
      now
    );
    expect(year).toBe('2020');
    expect(month).toBe('07');
    expect(humanizedDate).toBe('Last 30 Days');
    expect(longHumanizedDate).toBe('Last 30 Days');
  });

  it('correctly adjusts the month with a negative offset', () => {
    const { humanizedDate, longHumanizedDate, month, year } = parseMonthOffset(
      -1,
      now
    );
    expect(year).toBe('2020');
    expect(month).toBe('06');
    expect(humanizedDate).toBe('Jun 2020');
    expect(longHumanizedDate).toBe('June 2020');
  });

  it('correctly adjusts the year with a negative offset', () => {
    const { humanizedDate, longHumanizedDate, month, year } = parseMonthOffset(
      -7,
      now
    );
    expect(year).toBe('2019');
    expect(month).toBe('12');
    expect(humanizedDate).toBe('Dec 2019');
    expect(longHumanizedDate).toBe('December 2019');
  });

  it('correctly adjusts the month with a positive offset', () => {
    const { humanizedDate, longHumanizedDate, month, year } = parseMonthOffset(
      2,
      now
    );
    expect(year).toBe('2020');
    expect(month).toBe('09');
    expect(humanizedDate).toBe('Sep 2020');
    expect(longHumanizedDate).toBe('September 2020');
  });

  it('correctly adjusts the year with a positive offset', () => {
    const { humanizedDate, longHumanizedDate, month, year } = parseMonthOffset(
      9,
      now
    );
    expect(year).toBe('2021');
    expect(month).toBe('04');
    expect(humanizedDate).toBe('Apr 2021');
    expect(longHumanizedDate).toBe('April 2021');
  });
});

describe('getOffsetFromDate', () => {
  it('returns the number needed to offset the current date from the target date', () => {
    const d1 = DateTime.fromISO('2020-06-01T12:00:00');
    const d2 = DateTime.fromISO('2020-05-01T12:00:00');
    const d3 = DateTime.fromISO('2020-05-15T12:00:00');

    // Test from the beginning of the month.
    expect(getOffsetFromDate(now, d1)).toBe(-1);
    expect(getOffsetFromDate(now, d2)).toBe(-2);
    expect(getOffsetFromDate(now, d3)).toBe(-2);

    // Test from the middle of the month
    const midMonth = DateTime.fromISO('2020-07-15T12:00:00');
    expect(getOffsetFromDate(midMonth, now)).toBe(0);
    expect(getOffsetFromDate(midMonth, d1)).toBe(-1);
    expect(getOffsetFromDate(midMonth, d2)).toBe(-2);
    expect(getOffsetFromDate(midMonth, d3)).toBe(-2);
  });
});
