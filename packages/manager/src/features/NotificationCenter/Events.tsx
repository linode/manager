import * as React from 'react';
import NotificationSection, { NotificationItem } from './NotificationSection';

const NUM_EVENTS_DISPLAY = 20; // @todo adjust this number when the drawer is complete

interface Props {
  events: NotificationItem[];
  onClose?: () => void;
}

export const Events: React.FC<Props> = props => {
  const { events, onClose } = props;

  return (
    <NotificationSection
      content={events.slice(0, NUM_EVENTS_DISPLAY)}
      header="Events"
      showMoreTarget={'/events'}
      showMoreText={'View all events'}
      emptyMessage="No events to display."
      onClose={onClose}
      count={NUM_EVENTS_DISPLAY}
    />
  );
};

export default React.memo(Events);
