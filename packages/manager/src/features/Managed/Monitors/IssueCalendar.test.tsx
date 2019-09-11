import * as moment from 'moment';
import { managedIssues } from 'src/__data__/managedIssues';
import { createdOnTargetDay, generateCalendar } from './IssueCalendar';

const recentIssues = managedIssues.map((thisIssue, idx) => ({
  ...thisIssue,
  created: moment()
    .subtract(idx, 'days')
    .toISOString()
}));

describe('IssueCalendar methods', () => {
  describe('createdOnTargetDay', () => {
    it('should return true for an issue created on the target day', () => {
      const targetDay = moment.utc(managedIssues[1].created).tz('GMT');
      expect(createdOnTargetDay('GMT', managedIssues[1], targetDay)).toBe(true);
    });

    it('should return false for an issue created any other day', () => {
      const targetDay = moment.utc(managedIssues[1].created).tz('GMT');
      expect(createdOnTargetDay('GMT', managedIssues[0], targetDay)).toBe(
        false
      );
      expect(createdOnTargetDay('GMT', managedIssues[2], targetDay)).toBe(
        false
      );
    });
  });

  describe('generateCalendar', () => {
    it('should generate a calendar for the last 10 days', () => {
      const calendar = generateCalendar('GMT', recentIssues);
      expect(calendar[0].issues).toHaveLength(1);
      expect(moment(calendar[0].day).isSame(moment(), 'day')).toBe(true);

      expect(calendar[1].issues).toHaveLength(1);
      expect(
        moment(calendar[1].day).isSame(moment().subtract(1, 'days'), 'day')
      ).toBe(true);

      expect(calendar[2].issues).toHaveLength(1);
      expect(
        moment(calendar[2].day).isSame(moment().subtract(2, 'days'), 'day')
      ).toBe(true);

      expect(calendar[3].issues).toHaveLength(0);
      expect(
        moment(calendar[3].day).isSame(moment().subtract(3, 'days'), 'day')
      ).toBe(true);

      expect(calendar[4].issues).toHaveLength(0);
      expect(
        moment(calendar[4].day).isSame(moment().subtract(4, 'days'), 'day')
      ).toBe(true);

      expect(calendar[5].issues).toHaveLength(0);
      expect(
        moment(calendar[5].day).isSame(moment().subtract(5, 'days'), 'day')
      ).toBe(true);

      expect(calendar[6].issues).toHaveLength(0);
      expect(
        moment(calendar[6].day).isSame(moment().subtract(6, 'days'), 'day')
      ).toBe(true);

      expect(calendar[7].issues).toHaveLength(0);
      expect(
        moment(calendar[7].day).isSame(moment().subtract(7, 'days'), 'day')
      ).toBe(true);

      expect(calendar[8].issues).toHaveLength(0);
      expect(
        moment(calendar[8].day).isSame(moment().subtract(8, 'days'), 'day')
      ).toBe(true);

      expect(calendar[9].issues).toHaveLength(0);
      expect(
        moment(calendar[9].day).isSame(moment().subtract(9, 'days'), 'day')
      ).toBe(true);
    });

    it('should return the correct shape', () => {
      const calendar = generateCalendar('GMT', recentIssues);
      let i = 0;
      for (i; i < 10; i++) {
        expect(calendar[i]).toHaveProperty('issues');
        expect(calendar[i]).toHaveProperty('day');
      }
    });
  });
});
