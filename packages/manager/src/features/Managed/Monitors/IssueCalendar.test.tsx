import { DateTime } from 'luxon';
import { managedIssues } from 'src/__data__/managedIssues';
import { createdOnTargetDay, generateCalendar } from './IssueCalendar';

const recentIssues = managedIssues.map((thisIssue, idx) => ({
  ...thisIssue,
  created: DateTime.local()
    .minus({ days: idx })
    .toISO(),
}));

describe('IssueCalendar methods', () => {
  describe('createdOnTargetDay', () => {
    const targetDay = DateTime.fromISO(managedIssues[1].created, {
      zone: 'utc',
    }).setZone('GMT');

    it('should return true for an issue created on the target day', () => {
      expect(createdOnTargetDay('GMT', managedIssues[1], targetDay)).toBe(true);
    });

    it('should return false for an issue created any other day', () => {
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
      new Array(10).forEach(index => {
        expect(calendar[index - 1].issues).toHaveLength(1);
        expect(calendar[index - 1].day).toBe(
          DateTime.local().minus({ days: index - 1 }).day
        );
      });
    });

    it('should return the correct shape', () => {
      const calendar = generateCalendar('GMT', recentIssues);
      for (let i = 0; i < 10; i++) {
        expect(calendar[i]).toHaveProperty('issues');
        expect(calendar[i]).toHaveProperty('day');
      }
    });
  });
});
