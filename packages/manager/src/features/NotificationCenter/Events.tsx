import * as React from 'react';
import NotificationSection, { NotificationItem } from './NotificationSection';

interface Props {
  events: NotificationItem[];
  onClose?: () => void;
}

export const Events: React.FC<Props> = props => {
  const { events, onClose } = props;

  return (
    <NotificationSection
      content={events}
      header="Events"
      showMoreTarget={'/events'}
      showMoreText={'View all events'}
      emptyMessage="No events to display."
      onClose={onClose}
      count={20}
    />
  );
};

export default React.memo(Events);
