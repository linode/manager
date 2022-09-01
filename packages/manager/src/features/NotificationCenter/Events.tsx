import * as React from 'react';
import NotificationSection, { NotificationItem } from './NotificationSection';

const NUM_EVENTS_DISPLAY = 20;

interface Props {
  events: NotificationItem[];
}

export const Events: React.FC<Props> = (props) => {
  const { events } = props;

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
