import * as moment from 'moment';
import { isToday } from './isToday';

describe('isToday helper utility', () => {
  it('should return true for times within the same 24 hour period', () => {
    expect(
      isToday(
        moment().valueOf() / 1000,
        moment()
          .add(5, 'hours')
          .valueOf() / 1000
      )
    ).toBe(true);
  });

  it('should return true if start and end are the same', () => {
    expect(isToday(moment().valueOf() / 1000, moment().valueOf() / 1000)).toBe(
      true
    );
  });

  it('should return false if start is more than 24 hours before end', () => {
    expect(
      isToday(
        moment().valueOf() / 1000,
        moment()
          .add(25, 'hours')
          .valueOf() / 1000
      )
    ).toBe(false);
    expect(
      isToday(
        moment().valueOf() / 1000,
        moment()
          .add(1, 'months')
          .valueOf() / 1000
      )
    ).toBe(false);
  });
});
