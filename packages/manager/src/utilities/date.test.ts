import { DateTime } from 'luxon';

import { isWithinDays } from './date';

const expectedResults = [
  {
    date: DateTime.local().minus({ days: 20 }).toISODate(),
    days: 20,
    result: false,
  },
  {
    date: DateTime.local()
      .minus({ days: 365 * 2 })
      .toISODate(),
    days: 20,
    result: false,
  },
  {
    date: DateTime.local().minus({ days: 20 }).toISODate(),
    days: 365,
    result: true,
  },
  {
    date: DateTime.local().minus({ days: 89 }).toISODate(),
    days: 90,
    result: true,
  },
  {
    date: DateTime.local().minus({ days: 91 }).toISODate(),
    days: 90,
    result: false,
  },
];

describe('isWithinDays', () => {
  expectedResults.forEach(({ date, days, result }) => {
    it(`should return ${String(result)} since date ${date} ${
      result ? 'is' : 'is not'
    } within timeframe of ${days} days`, () => {
      expect(isWithinDays(days, date)).toBe(result);
    });
  });
});
