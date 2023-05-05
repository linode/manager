import * as React from 'react';
import { useEventNotifications } from './NotificationData/useEventNotifications';
import NotificationSection from './NotificationSection';
import { notificationContext as _notificationContext } from './NotificationContext';

const NUM_EVENTS_DISPLAY = 20;

export const Events = () => {
  const events = useEventNotifications();
  const notificationContext = React.useContext(_notificationContext);

  return (
    <NotificationSection
      content={events.slice(0, NUM_EVENTS_DISPLAY)}
      header="Events"
      showMore={{
        target: '/events',
        text: 'View all events',
        onClick: notificationContext.closeMenu,
      }}
      emptyMessage="No recent events to display."
      count={NUM_EVENTS_DISPLAY}
    />
  );
};

export default React.memo(Events);
