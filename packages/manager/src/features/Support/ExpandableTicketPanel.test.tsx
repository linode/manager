import * as moment from 'moment';

import { shouldRenderHively } from './Hively';
import { replaceVersionStringWithHTML } from './ExpandableTicketPanel';

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

describe('replaceVersionStringWithHTML', () => {
  it('should insert the version string into a <span />', () => {
    expect(
      replaceVersionStringWithHTML('Hello. Cloud Manager Version: 1.0.0')
    ).toBe('Hello. <span class="version">Cloud Manager Version: 1.0.0</span>');
  });

  it('only affects the last occurrence of a version string', () => {
    expect(
      replaceVersionStringWithHTML(
        'Hello. Cloud Manager Version: 1.0.0. World. Cloud Manager Version: 1.0.0'
      )
    ).toBe(
      'Hello. Cloud Manager Version: 1.0.0. World. <span class="version">Cloud Manager Version: 1.0.0</span>'
    );
  });

  it('leaves descriptions without a version string alone', () => {
    expect(
      replaceVersionStringWithHTML('This is a reply with no version string.')
    ).toBe('This is a reply with no version string.');
  });
});
