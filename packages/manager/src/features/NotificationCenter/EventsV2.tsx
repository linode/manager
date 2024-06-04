import * as React from 'react';

import { useEventNotificationsV2 } from './NotificationData/useEventNotificationsV2';
import { NotificationSection } from './NotificationSection';

const NUM_EVENTS_DISPLAY = 20;

export const EventsV2 = () => {
  const events = useEventNotificationsV2();

  return (
    <NotificationSection
      content={events.slice(0, NUM_EVENTS_DISPLAY)}
      count={NUM_EVENTS_DISPLAY}
      emptyMessage="No recent events to display."
      header="Events"
      showMoreTarget="/events"
      showMoreText="View all events"
    />
  );
};
