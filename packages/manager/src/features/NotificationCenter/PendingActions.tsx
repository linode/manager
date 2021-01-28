import * as React from 'react';
import NotificationSection, { NotificationItem } from './NotificationSection';

interface Props {
  pendingActions: NotificationItem[];
  onClose?: () => void;
}

export const PendingActions: React.FC<Props> = props => {
  const { pendingActions, onClose } = props;

  return (
    <NotificationSection
      content={pendingActions}
      header="Events"
      showMoreTarget={'/events'}
      showMoreText={'View all events'}
      emptyMessage="No events to display."
      onClose={onClose}
      count={20}
    />
  );
};

export default React.memo(PendingActions);
