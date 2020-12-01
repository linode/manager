import { DateTime } from 'luxon';
import { isWayInTheFuture } from './APITokenTable';

describe('isWayInTheFuture', () => {
  it('should return true if past 100 years in the future', () => {
    const todayPlus101Years = DateTime.local()
      .plus({ years: 101 })
      .toISO();

    expect(isWayInTheFuture(todayPlus101Years)).toBeTruthy();
  });

  it('should return false for years under 100 years in the future', () => {
    const todayPlus55Years = DateTime.local()
      .plus({ years: 55 })
      .toISO();
    expect(isWayInTheFuture(todayPlus55Years)).toBeFalsy();
  });
});
