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
      header="Pending Actions"
      showMoreTarget={'/events'}
      emptyMessage="There are no pending actions."
      onClose={onClose}
    />
  );
};

export default React.memo(PendingActions);
