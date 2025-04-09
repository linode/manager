import { DateTime, Duration } from 'luxon';

import {
  DATETIME_DISPLAY_FORMAT,
  ISO_DATETIME_NO_TZ_FORMAT,
} from 'src/constants';

import { formatDate, shouldHumanize } from './formatDate';
vi.mock('./getUserTimezone');

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
      // the time has to be in UTC if we want to use API time format as it is not localized
      const apiDate = DateTime.utc().toFormat(ISO_DATETIME_NO_TZ_FORMAT);
      const formattedDate = formatDate(apiDate);
      expect(formattedDate).toBe(
        DateTime.fromISO(apiDate, { zone: 'utc' }).toFormat(
          DATETIME_DISPLAY_FORMAT
        )
      );
    });
  });

  describe('Humanized Dates', () => {
    it('should output a few seconds ago for less than 30 secs', () => {
      // the time has to be in UTC if we want to use API time format as it is not localized
      const thirtySecsAgo = DateTime.utc()
        .minus({ seconds: 20 })
        .toFormat(ISO_DATETIME_NO_TZ_FORMAT);
      const formattedDate = formatDate(thirtySecsAgo, {
        humanizeCutoff: 'day',
      });
      expect(formattedDate).toBe('a few seconds ago');
    });
    it('should output humanized strings if the date is earlier than the cutoff', () => {
      // the time has to be in UTC if we want to use API time format as it is not localized
      const fiveMinutesAgo = DateTime.utc()
        .minus({ minutes: 5 })
        .toFormat(ISO_DATETIME_NO_TZ_FORMAT);
      const formattedDate = formatDate(fiveMinutesAgo, {
        humanizeCutoff: 'day',
      });
      expect(formattedDate).toBe('5 minutes ago');
    });
    describe('should output ISO strings if the date is older than the cutoff', () => {
      it('6 days < month', () => {
        // the time has to be in UTC if we want to use API time format as it is not localized
        const almostOneWeek = DateTime.utc()
          .minus({ days: 6 })
          .toFormat(ISO_DATETIME_NO_TZ_FORMAT);
        const formattedDate = formatDate(almostOneWeek, {
          humanizeCutoff: 'month',
        });
        expect(formattedDate).toBe('6 days ago');
      });
      it('6 days > day', () => {
        // the time has to be in UTC if we want to use API time format as it is not localized
        const almostOneWeek = DateTime.utc()
          .minus({ days: 6 })
          .toFormat(ISO_DATETIME_NO_TZ_FORMAT);
        const formattedDate = formatDate(almostOneWeek, {
          humanizeCutoff: 'day',
        });
        expect(formattedDate).toContain(
          DateTime.fromISO(almostOneWeek, { zone: 'utc' }).year
        );
      });
    });
    it('should always output formatted text if humanizedCutoff is set to never', () => {
      // the time has to be in UTC if we want to use API time format as it is not localized
      const aLongTimeAgo = DateTime.utc()
        .minus({ years: 10 })
        .toFormat(ISO_DATETIME_NO_TZ_FORMAT);
      const formattedDate = formatDate(aLongTimeAgo, {
        humanizeCutoff: 'never',
      });
      expect(formattedDate).toBe('10 years ago');
    });
  });
  describe('Humanize Future Dates', () => {
    it('should return "in a month" for dates 31 days in the future', () => {
      // the time has to be in UTC if we want to use API time format as it is not localized
      const daysInTheFuture = DateTime.utc()
        .plus({ days: 31, minutes: 2 })
        .toFormat(ISO_DATETIME_NO_TZ_FORMAT);
      const formattedDate = formatDate(daysInTheFuture, {
        humanizeCutoff: 'year',
      });
      expect(formattedDate).toBe('in 1 month');
    });
    it('should return amount of days for dates 23 days in the future', () => {
      // the time has to be in UTC if we want to use API time format as it is not localized
      const daysInTheFuture = DateTime.utc()
        .plus({ days: 23, hours: 6 })
        .toFormat(ISO_DATETIME_NO_TZ_FORMAT);
      const formattedDate = formatDate(daysInTheFuture, {
        humanizeCutoff: 'month',
      });
      expect(formattedDate).toBe('in 23 days');
    });
  });
});
