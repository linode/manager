import { DateTime } from 'luxon';
import md5 from 'md5';
import { useState } from 'react';

import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

import type { DismissedNotification } from 'src/types/ManagerPreferences';

/**
 * Handlers for dismissing notifications and checking if a notification has been dismissed.
 *
 * Notifications don't exist as entities in our API, so this is a workaround using the user
 * preferences endpoint.
 *
 * Any unique value can be used as a key, which will be passed through JSON.stringify and md5
 * to generate a unique hash for the notification. In the case of actual Notifications, we use
 * the full notification object, which is usually (but not guaranteed to be in all cases) unique.
 *
 * The options object allows you to specify the following options:
 * - prefix: a string prefix to use when generating the hash.
 *    The purpose of this is to dismiss the same notification in different contexts independently.
 * - expiry: all dismissed notifications are stale after 45 days, and will be cleaned up the next time
 *    dismissNotifications is called. However, if expiry is specified, a notification that has been dismissed
 *    and is now past the expiry date will a) no longer be considered dismissed; and b) will be cleaned up
 *    on the next preferences() call as if stale (as described above).
 * - label: an optional label that doesn't affect anything but makes it easier to find notifications inside
 *    the preferences object.
 */

export const STALE_DAYS = 45;

export interface DismissibleNotificationOptions {
  expiry?: string;
  label?: string;
  prefix?: string;
}
export interface DismissibleNotificationsHook {
  dismissNotifications: (
    notifications: unknown[],
    options?: DismissibleNotificationOptions
  ) => void;
  dismissedNotifications: Record<string, DismissedNotification>;
  hasDismissedNotifications: (
    notifications: unknown[],
    prefix?: string
  ) => boolean;
}

export const useDismissibleNotifications = (): DismissibleNotificationsHook => {
  const { data: dismissedNotificationPreferences } = usePreferences(
    (preferences) => preferences?.dismissed_notifications
  );
  const { mutateAsync: updatePreferences } = useMutatePreferences();
  const [dismissed, setDismissed] = useState(false);

  const dismissedNotifications = dismissedNotificationPreferences ?? {};

  const dismissNotifications = (
    _notifications: unknown[],
    options: DismissibleNotificationOptions = {}
  ) => {
    setDismissed(true);
    if (_notifications.length > 0) {
      updatePreferences({
        dismissed_notifications: updateDismissedNotifications(
          dismissedNotifications,
          _notifications,
          options
        ),
      });
    }
  };

  const hasDismissedNotifications = (
    _notifications: unknown[],
    prefix?: string
  ) => {
    if (dismissed) {
      return true;
    }
    return _notifications.every((thisNotification) => {
      const hashKey = getHashKey(thisNotification, prefix);
      // if the notification is present in our preferences, and
      // is not expired, it is considered dismissed.
      const dismissedNotification = dismissedNotifications[hashKey];
      return dismissedNotification && !isExpired(dismissedNotification.expiry);
    });
  };

  return {
    dismissNotifications,
    dismissedNotifications,
    hasDismissedNotifications,
  };
};

const getHashKey = (notification: unknown, prefix: string = '') =>
  md5(prefix + JSON.stringify(notification));

/**
 * Does two things:
 *  1. Adds the new notifications to the list of things that
 *     have been dismissed (or overrides it if the hashkey is
 *     already present)
 *  2. Removes any notifications older than 1.5 months (45 days).
 *     We do this to prevent user preferences from turning into
 *     an ever-expanding blob of old notification hashes.
 */
export const updateDismissedNotifications = (
  notifications: Record<string, DismissedNotification>,
  notificationsToDismiss: unknown[],
  options: DismissibleNotificationOptions
) => {
  const newNotifications: Record<string, DismissedNotification> = {};
  notificationsToDismiss.forEach((thisNotification) => {
    const hashKey = getHashKey(thisNotification, options.prefix);
    newNotifications[hashKey] = {
      created: DateTime.utc().toISO(),
      expiry: options.expiry,
      id: hashKey,
      label: options.label || options.prefix || undefined,
    };
  });
  return Object.values(notifications).reduce((acc, thisNotification) => {
    const stale = isStale(thisNotification.created);
    const expired = isExpired(thisNotification.expiry);
    return stale || expired
      ? acc
      : { ...acc, [thisNotification.id]: thisNotification };
  }, newNotifications);
};

export const isStale = (timestamp?: string) => {
  if (!timestamp) {
    return false;
  }
  return (
    Math.abs(DateTime.fromISO(timestamp).diffNow('days').toObject().days ?? 0) >
    STALE_DAYS
  );
};

export const isExpired = (timestamp?: string) => {
  if (!timestamp) {
    return false;
  }
  return DateTime.fromISO(timestamp).diffNow().milliseconds < 0;
};
