import { sumPublicOutboundTraffic, parseMonthOffset } from './TransferHistory';
import { Stats } from '@linode/api-v4/lib/linodes';

describe('combineGraphData', () => {
  const netStats: Stats['data']['netv4'] = {
    private_in: [],
    private_out: [],
    in: [],
    out: [
      [1, 100],
      [1, 200],
      [1, 300]
    ]
  };

  const stats: Stats = {
    title: 'Mock Stats',
    data: {
      cpu: [],
      netv4: netStats,
      netv6: netStats,
      io: { io: [], swap: [] }
    }
  };

  it('sums  public outbound v4 and v6 data', () => {
    expect(sumPublicOutboundTraffic(stats)).toEqual([
      [1, 200],
      [1, 400],
      [1, 600]
    ]);
  });
});

const testDate = new Date('2020-07-01T12:00:00');

describe('getYearAndMonthFromOffset', () => {
  it('returns the current year and month with an offset is 0', () => {
    const { year, month, humanizedDate } = parseMonthOffset(0, testDate);
    expect(year).toBe('2020');
    expect(month).toBe('07');
    expect(humanizedDate).toBe('Last 30 Days');
  });

  it('correctly adjusts the month based on the offset', () => {
    const { year, month, humanizedDate } = parseMonthOffset(-1, testDate);
    expect(year).toBe('2020');
    expect(month).toBe('06');
    expect(humanizedDate).toBe('Jun 2020');
  });

  it('correctly adjusts the year', () => {
    const { year, month, humanizedDate } = parseMonthOffset(-7, testDate);
    expect(year).toBe('2019');
    expect(month).toBe('12');
    expect(humanizedDate).toBe('Dec 2019');
  });

  it('throws an error if offset is > 0', () => {
    expect(() => parseMonthOffset(1, testDate)).toThrowError();
  });
});
