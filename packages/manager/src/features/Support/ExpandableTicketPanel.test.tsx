import * as moment from 'moment';

import { shouldRenderHively } from './ExpandableTicketPanel';

const recent = moment()
  .subtract(6, 'days')
  .format();
const old = moment()
  .subtract(3, 'months')
  .format();
const user = 'Linode';

describe('shouldRenderHively function', () => {
  it('should return true if an improperly formatted date is passed', () => {
    expect(shouldRenderHively(true, 'blah')).toBeTruthy();
  });
  it('should return true if the date is now', () => {
    expect(shouldRenderHively(true, moment().format())).toBeTruthy();
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
