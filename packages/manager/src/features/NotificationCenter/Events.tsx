import * as React from 'react';
import { useEventNotifications } from './NotificationData/useEventNotifications';
import { NotificationSection } from './NotificationSection';

const NUM_EVENTS_DISPLAY = 20;

export const Events = () => {
  const events = useEventNotifications();

  return (
    <NotificationSection
      content={events.slice(0, NUM_EVENTS_DISPLAY)}
      header="Events"
      showMoreTarget="/events"
      showMoreText="View all events"
      emptyMessage="No recent events to display."
      count={NUM_EVENTS_DISPLAY}
    />
  );
};

export default React.memo(Events);
