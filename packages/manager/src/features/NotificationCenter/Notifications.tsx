import * as React from 'react';
import { NotificationSection } from './NotificationSection';
import { useFormattedNotifications } from './NotificationData/useFormattedNotifications';

export const Notifications = () => {
  const notifications = useFormattedNotifications();

  return (
    <NotificationSection
      content={notifications}
      header="Notifications"
      emptyMessage="No notifications to display."
    />
  );
};

export default React.memo(Notifications);
