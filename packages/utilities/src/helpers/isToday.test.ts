import { describe, expect, it } from 'vitest';

import { DateTime } from 'luxon';

import { isToday } from './isToday';

describe('isToday helper utility', () => {
  it('should return true for times within the same 24 hour period', () => {
    expect(
      isToday(
        DateTime.local().valueOf() / 1000,
        DateTime.local().plus({ hours: 5 }).valueOf() / 1000,
      ),
    ).toBe(true);
  });

  it('should return true if start and end are the same', () => {
    expect(
      isToday(
        DateTime.local().valueOf() / 1000,
        DateTime.local().valueOf() / 1000,
      ),
    ).toBe(true);
  });

  it('should return false if start is more than 24 hours before end', () => {
    expect(
      isToday(
        DateTime.local().valueOf() / 1000,
        DateTime.local().plus({ hours: 25 }).valueOf() / 1000,
      ),
    ).toBe(false);
    expect(
      isToday(
        DateTime.local().valueOf() / 1000,
        DateTime.local().plus({ months: 1 }).valueOf() / 1000,
      ),
    ).toBe(false);
  });
});
