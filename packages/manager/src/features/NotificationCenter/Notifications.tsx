import * as React from 'react';
import { useFormattedNotifications } from './NotificationData/useFormattedNotifications';
import { NotificationSection } from './NotificationSection';

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
