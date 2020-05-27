import { DateTime, Duration } from 'luxon';
import { formatDate, shouldHumanize } from './formatDate';

const date = '2018-07-20T04:23:17';

describe('shouldHumanize', () => {
  it('should NOT humanize few days duration with day cutoff', () => {
    expect(
      shouldHumanize(DateTime.local().plus({ days: 23 }), 'day')
    ).toBeFalsy();
  });
  it('should humanize days duration with month cutoff', () => {
    const time = DateTime.local().plus({ days: 23 });
    expect(
      DateTime.local().plus(Duration.fromObject({ months: 1 })) > time
    ).toBeTruthy();
    expect(shouldHumanize(time, 'month')).toBeTruthy();
  });
});
describe('formatDate utility', () => {
  describe('Non-humanized dates', () => {
    it('should be displayed in 24-hour ISO format', () => {
      const formattedDate = formatDate(date);
      expect(formattedDate).toBe('2018-07-20 04:23:17');
    });
  });

  describe('Humanized Dates', () => {
    it('should output humanized strings if the date is earlier than the cutoff', () => {
      const fiveMinutesAgo = DateTime.local()
        .minus({ minutes: 5 })
        .toISO();
      const formattedDate = formatDate(fiveMinutesAgo, {
        humanizeCutoff: 'day'
      });
      expect(formattedDate).toBe('5 minutes ago');
    });
    it('should output ISO strings if the date is older than the cutoff', () => {
      const almostOneWeek = DateTime.local()
        .minus({ days: 6 })
        .toISO();
      let formattedDate = formatDate(almostOneWeek, {
        humanizeCutoff: 'month'
      });
      expect(formattedDate).toBe('6 days ago');

      formattedDate = formatDate(almostOneWeek, {
        humanizeCutoff: 'day'
      });
      expect(formattedDate).toContain(DateTime.fromISO(almostOneWeek).year);
    });
    it('should always output formatted text if humanizedCutoff is set to never', () => {
      const aLongTimeAgo = DateTime.local()
        .minus({ years: 10 })
        .toISO();
      const formattedDate = formatDate(aLongTimeAgo, {
        humanizeCutoff: 'never'
      });
      expect(formattedDate).toBe('10 years ago');
    });
    describe('Humanize Future Dates', () => {
      it('should return "in a month" for dates 31 days in the future', () => {
        const daysInTheFuture = DateTime.local()
          .plus({ days: 31, minutes: 2 })
          .toISO();
        const formattedDate = formatDate(daysInTheFuture, {
          humanizeCutoff: 'year'
        });
        expect(formattedDate).toBe('in 1 month');
      });
      it('should return amount of days for dates 23 days in the future', () => {
        const daysInTheFuture = DateTime.local()
          .plus({ days: 23, hours: 6 })
          .toISO();
        const formattedDate = formatDate(daysInTheFuture, {
          humanizeCutoff: 'month'
        });
        expect(formattedDate).toBe('in 23 days');
      });
    });
  });
});
