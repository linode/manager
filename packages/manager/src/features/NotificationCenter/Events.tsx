import * as React from 'react';

import { notificationContext as _notificationContext } from './NotificationContext';
import { useEventNotifications } from './NotificationData/useEventNotifications';
import { NotificationSection } from './NotificationSection';

const NUM_EVENTS_DISPLAY = 20;

export const Events = () => {
  const events = useEventNotifications();
  const notificationContext = React.useContext(_notificationContext);

  return (
    <NotificationSection
      showMore={{
        onClick: notificationContext.closeMenu,
        target: '/events',
        text: 'View all events',
      }}
      content={events.slice(0, NUM_EVENTS_DISPLAY)}
      count={NUM_EVENTS_DISPLAY}
      emptyMessage="No recent events to display."
      header="Events"
    />
  );
};

export default React.memo(Events);
