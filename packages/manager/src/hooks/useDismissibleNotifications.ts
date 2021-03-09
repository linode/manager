import { Notification } from '@linode/api-v4/lib/account/types';
import * as md5 from 'md5';
import { useState } from 'react';
import { usePreferences } from 'src/hooks/usePreferences';

export const useDismissibleNotifications = () => {
  const { preferences, updatePreferences } = usePreferences();
  const [dismissed, setDismissed] = useState(false);

  const dismissedNotifications = preferences?.dismissed_notifications ?? [];

  const dismissNotifications = (_notifications: Notification[]) => {
    const hashKey = getHashKey(_notifications);
    setDismissed(true);
    updatePreferences({
      dismissed_notifications: [...dismissedNotifications, hashKey],
    });
  };

  const hasDismissedNotifications = (_notifications: Notification[]) => {
    if (dismissed) {
      return true;
    }
    const hashKey = getHashKey(_notifications);
    return dismissedNotifications.includes(hashKey);
  };

  return {
    dismissNotifications,
    hasDismissedNotifications,
    dismissedNotifications,
  };
};

const getHashKey = (notifications: Notification[]) =>
  md5(JSON.stringify(notifications));

export default useDismissibleNotifications;
