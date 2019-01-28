import * as moment from 'moment';
import { isRecent } from './isRecent';

describe('isRecent', () => {
  const m = moment.utc(['2019', '00', '01']).format();

  it('should return false if time is in the future', () => {
    const t = moment(m)
      .add(1, 'minute')
      .format();
    expect(isRecent(t, m)).toBe(false);
  });

  it('should return true if time within 24 hours in the past', () => {
    const t1 = moment(m)
      .subtract(1, 'minute')
      .format();
    expect(isRecent(t1, m)).toBe(true);

    const t2 = moment(m)
      .subtract(23, 'hours')
      .subtract(59, 'minutes')
      .subtract(59, 'seconds')
      .format();
    expect(isRecent(t2, m)).toBe(true);
  });

  it('should return false if time is more than 24 hours ago', () => {
    const t1 = moment(m)
      .subtract(1, 'day')
      .format();
    expect(isRecent(t1, m)).toBe(false);

    const t2 = moment(m)
      .subtract(23, 'hours')
      .subtract(59, 'minutes')
      .subtract(60, 'seconds')
      .format();
    expect(isRecent(t2, m)).toBe(false);
  });
});
