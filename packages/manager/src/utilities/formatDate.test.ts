import * as moment from 'moment';

import formatDate from './formatDate';

const date = '2018-07-20T04:23:17';

describe('formatDate utility', () => {
  describe('Non-humanized dates', () => {
    it('should be displayed in 24-hour ISO format', () => {
      const formattedDate = formatDate(date);
      expect(formattedDate).toBe('2018-07-20 04:23:17');
    });
  });

  describe('Humanized Dates', () => {
    it('should output humanized strings if the date is earlier than the cutoff', () => {
      const fiveMinutesAgo = moment()
        .subtract(5, 'minutes')
        .format();
      const formattedDate = formatDate(fiveMinutesAgo, {
        humanizeCutoff: 'day'
      });
      expect(formattedDate).toBe('5 minutes ago');
    });
    it('should output ISO strings if the date is older than the cutoff', () => {
      const almostOneWeek = moment()
        .subtract(6, 'days')
        .format();
      let formattedDate = formatDate(almostOneWeek, {
        humanizeCutoff: 'month'
      });
      expect(formattedDate).toBe('6 days ago');

      formattedDate = formatDate(almostOneWeek, {
        humanizeCutoff: 'day'
      });
      expect(formattedDate).toContain(moment(almostOneWeek).year());
    });
    it('should always output formatted text if humanizedCutoff is set to never', () => {
      const aLongTimeAgo = moment()
        .subtract(10, 'years')
        .format();
      const formattedDate = formatDate(aLongTimeAgo, {
        humanizeCutoff: 'never'
      });
      expect(formattedDate).toBe('10 years ago');
    });
    describe('Humanize Future Dates', () => {
      it('should return "in a month" for dates 29 days in the future', () => {
        const daysInTheFuture = moment()
          .add(29, 'days')
          .format();
        const formattedDate = formatDate(daysInTheFuture, {
          humanizeCutoff: 'month'
        });
        expect(formattedDate).toBe('in a month');
      });
      it('should return amount of days for dates 23 days in the future', () => {
        const daysInTheFuture = moment()
          .add(23, 'days')
          .format();
        const formattedDate = formatDate(daysInTheFuture, {
          humanizeCutoff: 'month'
        });
        expect(formattedDate).toBe('in 23 days');
      });
    });
  });
});
