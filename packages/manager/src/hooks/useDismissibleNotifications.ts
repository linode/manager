import { Notification } from '@linode/api-v4/lib/account/types';
import { DateTime } from 'luxon';
import * as md5 from 'md5';
import { useState } from 'react';
import { usePreferences } from 'src/hooks/usePreferences';
import { DismissedNotification } from 'src/store/preferences/preferences.actions';

export interface DismissibleNotificationsHook {
  dismissedNotifications: Record<string, DismissedNotification>;
  hasDismissedNotifications: (notifications: Notification[]) => boolean;
  dismissNotifications: (notifications: Notification[]) => void;
}

export const useDismissibleNotifications = (): DismissibleNotificationsHook => {
  const { preferences, updatePreferences } = usePreferences();
  const [dismissed, setDismissed] = useState(false);

  const dismissedNotifications = preferences?.dismissed_notifications ?? {};

  const dismissNotifications = (_notifications: Notification[]) => {
    setDismissed(true);
    updatePreferences({
      dismissed_notifications: updateDismissedNotifications(
        dismissedNotifications,
        _notifications
      ),
    });
  };

  const hasDismissedNotifications = (_notifications: Notification[]) => {
    if (dismissed) {
      return true;
    }
    return _notifications.some((thisNotification) => {
      const hashKey = getHashKey(thisNotification);
      return Boolean(dismissedNotifications[hashKey]);
    });
  };

  return {
    dismissNotifications,
    hasDismissedNotifications,
    dismissedNotifications,
  };
};

const getHashKey = (notification: Notification) =>
  md5(JSON.stringify(notification));

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
  notificationsToDismiss: Notification[]
) => {
  const newNotifications = {};
  notificationsToDismiss.forEach((thisNotification) => {
    const hashKey = getHashKey(thisNotification);
    notifications[hashKey] = {
      id: hashKey,
      created: DateTime.utc().toLocaleString(),
    };
  });
  return Object.values(notifications).reduce((acc, thisNotification) => {
    const isStale =
      DateTime.fromISO(thisNotification.created).diffNow('days').days > 60;
    return isStale ? { ...acc, [thisNotification.id]: thisNotification } : acc;
  }, newNotifications);
};

export default useDismissibleNotifications;
