import * as moment from 'moment';
import { isWayInTheFuture } from './APITokenTable';

describe('isWayInTheFuture', () => {
  it('should return true if past 100 years in the future', () => {
    const todayPlus101Years = moment.utc().add(101, 'years').format();
    expect(isWayInTheFuture(todayPlus101Years)).toBeTruthy();
  });

  it('should return false for years under 100 years in the future', () => {
    const todayPlus55Years = moment.utc().add(55, 'years').format();
    expect(isWayInTheFuture(todayPlus55Years)).toBeFalsy();
  });
});