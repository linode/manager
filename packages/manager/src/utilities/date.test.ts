import { DateTime } from 'luxon';
import { createdWithinDays } from './date';

const expectedResults = [
  { days: 20, date: '2021-06-10T18:26:54', result: false },
  { days: 365, date: '2021-06-10T18:26:54', result: true },
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

describe('createdWithinDays', () => {
  expectedResults.forEach(({ days, date, result }) => {
    it(`should return ${String(result)} since date is ${
      !result && 'not'
    } within timeframe`, () => {
      expect(createdWithinDays(days, date)).toBe(result);
    });
  });
});
