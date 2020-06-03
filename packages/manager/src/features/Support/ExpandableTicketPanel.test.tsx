import { DateTime } from 'luxon';
import { API_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import { shouldRenderHively } from './Hively';

const recent = DateTime.utc()
  .minus({ days: 6 })
  .toFormat(API_DATETIME_NO_TZ_FORMAT);
const old = DateTime.utc()
  .minus({ months: 3 })
  .toFormat(API_DATETIME_NO_TZ_FORMAT);
const user = 'Linode';

describe('shouldRenderHively function', () => {
  it('should return true if an improperly formatted date is passed', () => {
    expect(shouldRenderHively(true, 'blah')).toBeTruthy();
  });
  it('should return true if the date is now', () => {
    expect(
      shouldRenderHively(
        true,
        DateTime.utc().toFormat(API_DATETIME_NO_TZ_FORMAT)
      )
    ).toBeTruthy();
  });
  it('should return true if the date is within the past 7 days', () => {
    expect(shouldRenderHively(true, recent)).toBeTruthy();
  });
  it('should return false for dates older than 7 days', () => {
    expect(shouldRenderHively(true, old)).toBeFalsy();
  });
  it('should return false if the fromLinode parameter is false', () => {
    expect(shouldRenderHively(false, recent)).toBeFalsy();
  });
  it('should return false if the user is Linode', () => {
    expect(shouldRenderHively(false, recent, user)).toBeFalsy();
  });
});
