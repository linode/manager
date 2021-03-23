import { DateTime } from 'luxon';
import * as md5 from 'md5';
import { useState } from 'react';
import { usePreferences } from 'src/hooks/usePreferences';
import { DismissedNotification } from 'src/store/preferences/preferences.actions';

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
 * The optional prefix prop allows you to specify a random string to be used as a prefix when generating
 * the hash. The purpose of this is to dismiss the same notification in different contexts independently.
 */
export interface DismissibleNotificationsHook {
  dismissedNotifications: Record<string, DismissedNotification>;
  hasDismissedNotifications: (
    notifications: unknown[],
    prefix?: string
  ) => boolean;
  dismissNotifications: (notifications: unknown[], prefix?: string) => void;
}

export const useDismissibleNotifications = (): DismissibleNotificationsHook => {
  const { preferences, updatePreferences } = usePreferences();
  const [dismissed, setDismissed] = useState(false);

  const dismissedNotifications = preferences?.dismissed_notifications ?? {};

  const dismissNotifications = (_notifications: unknown[], prefix?: string) => {
    setDismissed(true);
    updatePreferences({
      dismissed_notifications: updateDismissedNotifications(
        dismissedNotifications,
        _notifications,
        prefix
      ),
    });
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
      return Boolean(dismissedNotifications[hashKey]);
    });
  };

  return {
    dismissNotifications,
    hasDismissedNotifications,
    dismissedNotifications,
  };
};

const getHashKey = (notification: unknown, prefix: string = '') =>
  md5(prefix + JSON.stringify(notification));

/**
 * Does two things:
 *  1. Adds the new notifications to the list of things that
 *     have been dismissed (or overrides it if the hashkey is
 *     already present)
 *  2. Removes any notifications older than 2 months (60 days).
 *     We do this to prevent user preferences from turning into
 *     an ever-expanding blob of old notification hashes.
 */
const updateDismissedNotifications = (
  notifications: Record<string, DismissedNotification>,
  notificationsToDismiss: unknown[],
  prefix?: string
) => {
  const newNotifications = {};
  notificationsToDismiss.forEach((thisNotification) => {
    const hashKey = getHashKey(thisNotification, prefix);
    newNotifications[hashKey] = {
      id: hashKey,
      created: DateTime.utc().toLocaleString(),
    };
  });
  return Object.values(notifications).reduce((acc, thisNotification) => {
    const isStale =
      DateTime.fromISO(thisNotification.created).diffNow('days').toObject()
        .days ?? 0 > 60;
    return isStale ? acc : { ...acc, [thisNotification.id]: thisNotification };
  }, newNotifications);
};

export default useDismissibleNotifications;
