import { DateTime } from 'luxon';
import { isRecent } from './isRecent';

describe('isRecent', () => {
  const baseDate = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  const m = baseDate.toISO();

  it('should return false if time is in the future', () => {
    const t = baseDate.plus({ minutes: 1 }).toISO();
    expect(isRecent(t, m)).toBe(false);
  });

  it('should return true if 1 min in the past', () => {
    const t1 = DateTime.fromISO(m).minus({ minutes: 1 }).toISO();
    expect(isRecent(t1, m)).toBe(true);
  });

  it('should return true if time 23:59:58 in the past', () => {
    const t2 = DateTime.fromISO(m)
      .minus({ hours: 23, minutes: 59, seconds: 58 })
      .toISO();

    expect(isRecent(t2, m)).toBe(true);
  });

  it('should return false if time is 1 day in the past', () => {
    const t1 = baseDate.minus({ days: 1 }).toISO();
    expect(isRecent(t1, m)).toBe(false);
  });

  it('should return false if 24:01 in the past', () => {
    const t2 = baseDate.minus({ hours: 24, seconds: 1 }).toISO();
    expect(isRecent(t2, m)).toBe(false);
  });
});
