import { DateTime } from 'luxon';

import {
  isExpired,
  isStale,
  STALE_DAYS,
  updateDismissedNotifications,
} from './useDismissibleNotifications';

describe('Dismissible notifications', () => {
  describe('isStale handlers', () => {
    it('Should return true if the notification was created more than 45 days ago', () => {
      expect(
        isStale(
          DateTime.utc()
            .minus({ days: STALE_DAYS + 1 })
            .toISO()
        )
      ).toBe(true);
    });

    it('Should return false if the notification was created fewer than 45 days ago', () => {
      expect(
        isStale(
          DateTime.utc()
            .minus({ days: STALE_DAYS - 1 })
            .toISO()
        )
      ).toBe(false);
    });

    it('Should return false if the timestamp is not provided', () => {
      expect(isStale()).toBe(false);
    });
  });

  describe('isExpired helper', () => {
    it('should return true if the expiry is in the past', () => {
      expect(isExpired(DateTime.utc().minus({ seconds: 30 }).toISO())).toBe(
        true
      );
    });

    it('should return false if the expiry is in the future or is undefined', () => {
      expect(isExpired(DateTime.utc().plus({ minutes: 30 }).toISO())).toBe(
        false
      );

      expect(isExpired()).toBe(false);
    });
  });

  describe('updateDismissedNotifications', () => {
    const dismissedNotifications = {
      expired: {
        created: DateTime.utc().plus({ minutes: 5 }).toISO(),
        expiry: DateTime.utc().minus({ minutes: 5 }).toISO(),
        id: 'expired',
      },
      normal: {
        created: DateTime.utc().plus({ minutes: 5 }).toISO(),
        id: 'normal',
      },
      stale: {
        created: DateTime.utc()
          .minus({ days: STALE_DAYS + 1 })
          .toISO(),
        id: 'stale',
      },
    };
    it('should include existing dismissed notifications', () => {
      expect(
        updateDismissedNotifications(dismissedNotifications, [], {})
      ).toHaveProperty('normal');
    });

    it('should not include notifications created more than 45 days ago', () => {
      expect(
        updateDismissedNotifications(dismissedNotifications, [], {})
      ).not.toHaveProperty('stale');
    });

    it('should not include notifications past their specified expiry', () => {
      expect(
        updateDismissedNotifications(dismissedNotifications, [], {})
      ).not.toHaveProperty('expired');
    });
  });
});
