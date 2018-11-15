import * as moment from 'moment';

import formatDate from './formatDate';

const date = '2018-07-20T04:23:17';
const timezone = 'America/New_York';

describe('formatDate utility', () => {
  describe('Non-humanized dates', () => {
    it('should be displayed in 24-hour ISO format', () => {
      const formattedDate = formatDate(date, { timezone });
      expect(formattedDate).toBe('2018-07-20 00:23:17');
    });
  });

  describe('Humanized dates', () => {
    it('should output humanized strings if the date is earlier than the cutoff', () => {
      const fiveMinutesAgo = moment().subtract(5, 'minutes').format();
      const formattedDate = formatDate(fiveMinutesAgo, { timezone, humanizeCutoff: 'day' })
      expect(formattedDate).toBe('5 minutes ago');
    });
    it('should output ISO strings if the date is older than the cutoff', () => {
      const almostOneWeek = moment().subtract(6, 'days').format();
      let formattedDate = formatDate(almostOneWeek, { timezone, humanizeCutoff: 'month' });
      expect(formattedDate).toBe('6 days ago');

      formattedDate = formatDate(almostOneWeek, { timezone, humanizeCutoff: 'day' });
      expect(formattedDate).toContain(moment(almostOneWeek).year());
    });
      it('should always output formatted text if humanizedCutoff is set to never', () => {
        const aLongTimeAgo = moment().subtract(10, 'years').format();
        const formattedDate = formatDate(aLongTimeAgo, { timezone, humanizeCutoff: 'never' });
        expect(formattedDate).toBe('10 years ago');
    })
  })
});