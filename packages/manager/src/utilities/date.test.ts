import { DateTime } from 'luxon';
import { isWithinDays } from './date';

const expectedResults = [
  {
    days: 20,
    date: DateTime.local().minus({ days: 20 }).toISODate(),
    result: false,
  },
  {
    days: 20,
    date: DateTime.local()
      .minus({ days: 365 * 2 })
      .toISODate(),
    result: false,
  },
  {
    days: 365,
    date: DateTime.local().minus({ days: 20 }).toISODate(),
    result: true,
  },
  {
    days: 90,
    date: DateTime.local().minus({ days: 89 }).toISODate(),
    result: true,
  },
  {
    days: 90,
    date: DateTime.local().minus({ days: 91 }).toISODate(),
    result: false,
  },
];

describe('isWithinDays', () => {
  expectedResults.forEach(({ days, date, result }) => {
    it(`should return ${String(result)} since date ${date} ${
      result ? 'is' : 'is not'
    } within timeframe of ${days} days`, () => {
      expect(isWithinDays(days, date)).toBe(result);
    });
  });
});
